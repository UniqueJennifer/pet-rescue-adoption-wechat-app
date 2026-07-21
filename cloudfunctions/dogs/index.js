const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('dogs')

const demoDogs = [
  {
    id: 'demo-dog-1',
    _id: 'demo-dog-1',
    name: '小满',
    size: '中型犬',
    temperament: '温顺亲人',
    age: '3岁',
    gender: '母',
    health: '已免疫，身体稳定',
    note: '牵引稳定，适合第一次参加遛狗的志愿者',
    available: true,
    sort: 1,
    cover: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'demo-dog-2',
    _id: 'demo-dog-2',
    name: '豆包',
    size: '小型犬',
    temperament: '活泼好奇',
    age: '1岁半',
    gender: '公',
    health: '已驱虫，已接种疫苗',
    note: '喜欢探索，建议遛狗时保持短牵引',
    available: true,
    sort: 2,
    cover: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=900&q=80'
  }
]

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
        data: res.data.length ? res.data.map(normalizeDog) : demoDogs
      }
    } catch (error) {
      return {
        ok: true,
        data: demoDogs
      }
    }
  }

  return {
    ok: false,
    message: '未知操作'
  }
}
