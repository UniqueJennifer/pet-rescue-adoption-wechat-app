const CLOUD_ENV = 'cloud1-d0gq6eabrd8d306a5'

const ADOPTIONS_KEY = 'pet_rescue_adoptions'
const BOOKINGS_KEY = 'pet_rescue_bookings'
const USER_KEY = 'pet_rescue_user'

const defaultAdoptions = [
  {
    id: 'a1',
    name: '糯米',
    type: '猫咪',
    breed: '中华田园猫',
    age: '8个月',
    gender: '母',
    diseaseHistory: '曾有轻微猫鼻支',
    recovered: '已痊愈',
    vaccinated: '已接种',
    contact: '微信 rescue-cat-01',
    ownerId: 'shelter',
    ownerName: '天津小动保TAPA',
    status: '待领养',
    cover: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=900&q=80'],
    intro: '亲人安静，已完成基础驱虫，会使用猫砂，适合有耐心的新手家庭。'
  },
  {
    id: 'a2',
    name: '豆包',
    type: '狗狗',
    breed: '混血犬',
    age: '2岁',
    gender: '公',
    diseaseHistory: '无明显疾病史',
    recovered: '无疾病',
    vaccinated: '已接种',
    contact: '电话 13800000000',
    ownerId: 'shelter',
    ownerName: '天津小动保TAPA',
    status: '待领养',
    cover: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80'],
    intro: '性格稳定，喜欢散步，已绝育，适合有固定遛狗时间的家庭。'
  },
  {
    id: 'a3',
    name: '小橘',
    type: '猫咪',
    breed: '橘猫',
    age: '1岁',
    gender: '公',
    diseaseHistory: '皮肤病治疗史',
    recovered: '已痊愈',
    vaccinated: '未完整接种',
    contact: '微信 warmhome-02',
    ownerId: 'shelter',
    ownerName: '天津小动保TAPA',
    status: '待领养',
    cover: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80'],
    intro: '活泼黏人，身体健康，希望领养人接受定期回访。'
  }
]

const defaultShelterDogs = [
  {
    id: 'd1',
    name: '阿福',
    size: '中型犬',
    temperament: '温顺亲人',
    note: '适合第一次参加遛狗的志愿者',
    cover: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'd2',
    name: '可乐',
    size: '小型犬',
    temperament: '活泼好奇',
    note: '需要牵引绳保持较短距离',
    cover: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'd3',
    name: '团团',
    size: '大型犬',
    temperament: '稳定听话',
    note: '建议有大型犬经验的志愿者预约',
    cover: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=80'
  }
]

const WALK_LOCATION = '导航天津小动保基地'
const SHELTER_PHONE = '15022278701'
const timeSlots = ['13点', '14点', '15点', '16点', '17点']

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function createWalkDates() {
  const dates = []
  const current = new Date()
  current.setHours(0, 0, 0, 0)
  current.setDate(current.getDate() + 1)

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(current)
    date.setDate(current.getDate() + index)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    dates.push({
      value: `${year}-${padNumber(month)}-${padNumber(day)}`,
      month,
      day,
      monthLabel: `${month}月`,
      dayLabel: `${day}日`,
      label: `${month}月${day}日`
    })
  }

  return dates
}

function getStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value || fallback
  } catch (error) {
    return fallback
  }
}

function setStorage(key, value) {
  wx.setStorageSync(key, value)
}

function getUser() {
  return getStorage(USER_KEY, null)
}

function isCloudReady() {
  return !!(wx.cloud && wx.cloud.callFunction)
}

async function callCloudFunction(name, data) {
  if (!isCloudReady()) {
    throw new Error('cloud is not ready')
  }
  const res = await wx.cloud.callFunction({ name, data })
  return res.result || {}
}

function ensureSeedData() {
  if (!wx.getStorageSync(ADOPTIONS_KEY)) {
    setStorage(ADOPTIONS_KEY, defaultAdoptions)
  }
  if (!wx.getStorageSync(BOOKINGS_KEY)) {
    setStorage(BOOKINGS_KEY, [])
  }
}

function getLocalAdoptions() {
  ensureSeedData()
  return getStorage(ADOPTIONS_KEY, defaultAdoptions)
}

function getLocalBookings() {
  ensureSeedData()
  return getStorage(BOOKINGS_KEY, [])
}

async function getAdoptions() {
  try {
    const result = await callCloudFunction('adoptions', { action: 'list' })
    if (result.ok) return result.data || []
  } catch (error) {
    return getLocalAdoptions()
  }
  return getLocalAdoptions()
}

async function getAdoptionsForUser(userId) {
  if (!userId) return []
  try {
    const result = await callCloudFunction('adoptions', { action: 'my' })
    if (result.ok) return result.data || []
  } catch (error) {
    return getLocalAdoptions().filter((item) => item.ownerId === userId)
  }
  return getLocalAdoptions().filter((item) => item.ownerId === userId)
}

async function getAdoptionById(id) {
  if (!id) return null
  try {
    const result = await callCloudFunction('adoptions', {
      action: 'detail',
      id
    })
    if (result.ok) return result.data
  } catch (error) {
    return getLocalAdoptions().find((item) => item.id === id || item._id === id) || null
  }
  return getLocalAdoptions().find((item) => item.id === id || item._id === id) || null
}

async function addAdoption(payload) {
  const user = getUser()
  const item = {
    ...payload,
    ownerId: user ? user.id : '',
    ownerName: user ? user.nickname : '未登录用户',
    status: '待领养'
  }

  try {
    const result = await callCloudFunction('adoptions', {
      action: 'create',
      adoption: item
    })
    if (result.ok) return result.data
    return { ok: false, message: result.message || '发布失败' }
  } catch (error) {
    return {
      ok: false,
      message: '发布失败，请检查云开发配置后重试'
    }
  }
}

async function deleteAdoption(id, ownerId) {
  try {
    const result = await callCloudFunction('adoptions', {
      action: 'delete',
      id
    })
    if (result.ok) return true
    return false
  } catch (error) {
    const list = getLocalAdoptions()
    const nextList = list.filter((item) => item.id !== id || (item.ownerId && item.ownerId !== ownerId))
    setStorage(ADOPTIONS_KEY, nextList)
    return true
  }
}

async function getBookings() {
  try {
    const result = await callCloudFunction('bookings', { action: 'list' })
    if (result.ok) return result.data || []
  } catch (error) {
    return getLocalBookings()
  }
  return getLocalBookings()
}

async function getBookingsForUser(userId) {
  if (!userId) return []
  try {
    const result = await callCloudFunction('bookings', { action: 'my' })
    if (result.ok) return result.data || []
  } catch (error) {
    return getLocalBookings().filter((booking) => booking.userId === userId)
  }
  return getLocalBookings().filter((booking) => booking.userId === userId)
}

async function addBooking(payload) {
  const user = getUser()
  if (!user) {
    return {
      ok: false,
      message: '请先登录后预约'
    }
  }

  const dogs = await getShelterDogs()
  const dog = dogs.find((item) => item.id === payload.dogId)
  const bookingPayload = {
    ...payload,
    dogName: dog ? dog.name : 'TAPA小狗',
    dogCover: dog ? dog.cover : '',
    location: WALK_LOCATION,
    shelterPhone: SHELTER_PHONE,
    visitorName: payload.visitorName,
    phone: payload.phone
  }

  try {
    return await callCloudFunction('bookings', {
      action: 'create',
      booking: bookingPayload
    })
  } catch (error) {
    const bookings = getLocalBookings()
    const sameDayBooking = bookings.find((booking) => booking.userId === user.id && booking.date === payload.date)
    if (sameDayBooking) {
      return {
        ok: false,
        message: '每人每天最多预约一次'
      }
    }

    const sameDogDay = bookings.find((booking) => booking.dogId === payload.dogId && booking.date === payload.date)
    if (sameDogDay) {
      return {
        ok: false,
        message: '这只小狗当天已被预约'
      }
    }

    const booking = {
      id: `b${Date.now()}`,
      userId: user.id,
      userName: user.nickname,
      status: '已预约',
      ...bookingPayload
    }
    setStorage(BOOKINGS_KEY, [booking].concat(bookings))
    return {
      ok: true,
      booking
    }
  }
}

async function uploadAdoptionImage(filePath) {
  if (!filePath || /^https?:\/\//.test(filePath) || /^cloud:\/\//.test(filePath)) {
    return filePath
  }
  if (!wx.cloud || !wx.cloud.uploadFile) {
    throw new Error('cloud upload is not ready')
  }

  const extMatch = filePath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  const ext = extMatch ? extMatch[1] : 'jpg'
  const cloudPath = `adoption-images/${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`
  try {
    const result = await wx.cloud.uploadFile({
      cloudPath,
      filePath
    })
    return result.fileID
  } catch (error) {
    throw error
  }
}

async function uploadAdoptionImages(filePaths) {
  const images = []
  for (let index = 0; index < filePaths.length; index += 1) {
    const fileID = await uploadAdoptionImage(filePaths[index])
    images.push(fileID)
  }
  return images
}

async function saveUser(user) {
  let openid = ''
  try {
    const result = await callCloudFunction('login', {})
    openid = result.openid || ''
  } catch (error) {
    openid = ''
  }

  const nextUser = {
    id: user.id || openid || `u${Date.now()}`,
    openid,
    avatar: user.avatar || '',
    nickname: user.nickname || 'TAPA用户',
    phone: user.phone || '',
    loginType: user.loginType || 'phone'
  }
  setStorage(USER_KEY, nextUser)
  return nextUser
}

function logout() {
  wx.removeStorageSync(USER_KEY)
}

async function getShelterDogs() {
  try {
    const result = await callCloudFunction('dogs', { action: 'list' })
    if (result.ok) {
      return result.data || []
    }
  } catch (error) {
    return defaultShelterDogs
  }
  return defaultShelterDogs
}

function getWalkDates() {
  return createWalkDates()
}

function getTimeSlots() {
  return timeSlots
}

function getWalkLocation() {
  return WALK_LOCATION
}

function getShelterPhone() {
  return SHELTER_PHONE
}

module.exports = {
  CLOUD_ENV,
  addAdoption,
  addBooking,
  deleteAdoption,
  ensureSeedData,
  getAdoptionById,
  getAdoptions,
  getAdoptionsForUser,
  getBookings,
  getBookingsForUser,
  getShelterPhone,
  getShelterDogs,
  getTimeSlots,
  getUser,
  getWalkDates,
  getWalkLocation,
  logout,
  saveUser,
  uploadAdoptionImage,
  uploadAdoptionImages
}
