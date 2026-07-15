const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('dogs')

function normalizeDog(item) {
  return {
    id: item._id,
    ...item
  }
}

exports.main = async function(event) {
  const action = event.action

  if (action === 'list') {
    try {
      const res = await collection
        .where({
          available: db.command.neq(false)
        })
        .orderBy('sort', 'asc')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()

      return {
        ok: true,
        data: res.data.map(normalizeDog)
      }
    } catch (error) {
      return {
        ok: true,
        data: []
      }
    }
  }

  return {
    ok: false,
    message: '未知操作'
  }
}