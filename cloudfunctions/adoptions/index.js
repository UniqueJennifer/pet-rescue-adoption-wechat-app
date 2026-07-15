const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('adoptions')

function normalizeItem(item) {
  return {
    id: item._id,
    ...item
  }
}

function isCloudFile(file) {
  return typeof file === 'string' && file.indexOf('cloud://') === 0
}

function isWebImage(file) {
  return typeof file === 'string' && /^https?:\/\//.test(file)
}

function isUsableImage(file) {
  return isCloudFile(file) || isWebImage(file)
}

async function attachTempImageUrls(items) {
  const fileIDs = []
  items.forEach((item) => {
    if (isCloudFile(item.cover)) fileIDs.push(item.cover)
    if (Array.isArray(item.images)) {
      item.images.forEach((image) => {
        if (isCloudFile(image)) fileIDs.push(image)
      })
    }
  })

  const uniqueFileIDs = Array.from(new Set(fileIDs))
  if (!uniqueFileIDs.length) return items

  const tempRes = await cloud.getTempFileURL({ fileList: uniqueFileIDs })
  const urlMap = {}
  ;(tempRes.fileList || []).forEach((file) => {
    urlMap[file.fileID] = file.tempFileURL || file.fileID
  })

  return items.map((item) => {
    const images = Array.isArray(item.images)
      ? item.images.map((image) => urlMap[image] || image)
      : []
    return {
      ...item,
      cover: urlMap[item.cover] || item.cover,
      images
    }
  })
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action

  if (action === 'list') {
    try {
      const res = await collection.orderBy('createTime', 'desc').limit(100).get()
      const data = await attachTempImageUrls(res.data.map(normalizeItem))
      return {
        ok: true,
        data
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
      const res = await collection.where({ ownerId: openid }).orderBy('createTime', 'desc').limit(100).get()
      const data = await attachTempImageUrls(res.data.map(normalizeItem))
      return {
        ok: true,
        data
      }
    } catch (error) {
      return {
        ok: true,
        data: []
      }
    }
  }

  if (action === 'detail') {
    const id = event.id
    if (!id) {
      return {
        ok: false,
        message: '缺少领养信息ID'
      }
    }
    try {
      const res = await collection.doc(id).get()
      const data = await attachTempImageUrls([normalizeItem(res.data)])
      return {
        ok: true,
        data: data[0]
      }
    } catch (error) {
      return {
        ok: false,
        message: '未找到领养信息'
      }
    }
  }

  if (action === 'create') {
    const adoption = event.adoption || {}
    if (!adoption.name || !adoption.breed || !adoption.age || !adoption.contact) {
      return {
        ok: false,
        message: '请补全领养信息'
      }
    }

    const now = db.serverDate()
    const images = Array.isArray(adoption.images) ? adoption.images.slice(0, 9) : []
    const cover = adoption.cover || images[0] || ''
    if (!images.length || images.some((image) => !isUsableImage(image)) || (cover && !isUsableImage(cover))) {
      return {
        ok: false,
        message: '照片上传失败，请重新选择照片后发布'
      }
    }
    const data = {
      ...adoption,
      images,
      cover,
      ownerId: openid,
      ownerName: adoption.ownerName || 'TAPA用户',
      status: '待领养',
      createTime: now,
      updateTime: now
    }
    delete data.id

    const res = await collection.add({ data })
    return {
      ok: true,
      data: {
        id: res._id,
        _id: res._id,
        ...data
      }
    }
  }

  if (action === 'delete') {
    const id = event.id
    if (!id) {
      return {
        ok: false,
        message: '缺少领养信息ID'
      }
    }

    const current = await collection.doc(id).get()
    if (!current.data || current.data.ownerId !== openid) {
      return {
        ok: false,
        message: '只能删除自己发布的领养信息'
      }
    }

    await collection.doc(id).remove()
    return {
      ok: true
    }
  }

  return {
    ok: false,
    message: '未知操作'
  }
}
