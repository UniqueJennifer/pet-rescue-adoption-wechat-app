const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('bookings')

function normalizeItem(item) {
  return {
    id: item._id,
    ...item
  }
}

async function createBooking(openid, booking) {
  const sameDayBooking = await collection.where({
    userId: openid,
    date: booking.date
  }).limit(1).get()

  if (sameDayBooking.data.length) {
    return {
      ok: false,
      message: '每人每天最多预约一次'
    }
  }

  const sameDogDay = await collection.where({
    dogId: booking.dogId,
    date: booking.date
  }).limit(1).get()

  if (sameDogDay.data.length) {
    return {
      ok: false,
      message: '这只小狗当天已被预约'
    }
  }

  const now = db.serverDate()
  const data = {
    ...booking,
    userId: openid,
    userName: booking.userName || 'TAPA用户',
    status: '已预约',
    createTime: now,
    updateTime: now
  }
  delete data.id

  const res = await collection.add({ data })
  return {
    ok: true,
    booking: {
      id: res._id,
      _id: res._id,
      ...data
    }
  }
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action

  if (action === 'list') {
    try {
      const res = await collection.orderBy('createTime', 'desc').limit(100).get()
      return {
        ok: true,
        data: res.data.map(normalizeItem)
      }
    } catch (error) {
      return {
        ok: true,
        data: []
      }
    }
  }

  if (action === 'my') {
    try {
      const res = await collection.where({ userId: openid }).orderBy('createTime', 'desc').limit(100).get()
      return {
        ok: true,
        data: res.data.map(normalizeItem)
      }
    } catch (error) {
      return {
        ok: true,
        data: []
      }
    }
  }

  if (action === 'create') {
    const booking = event.booking || {}
    if (!booking.dogId || !booking.date || !booking.time || !booking.visitorName || !booking.phone) {
      return {
        ok: false,
        message: '请补全预约信息'
      }
    }
    return createBooking(openid, booking)
  }

  return {
    ok: false,
    message: '未知操作'
  }
}