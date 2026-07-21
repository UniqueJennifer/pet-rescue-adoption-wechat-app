const store = require('../../utils/store')

function createNumberOptions(max) {
  return Array.from({ length: max }, function(_, index) {
    return `${index + 1}号`
  })
}

const dogBaseOptions = ['新基地', '旧基地']
const newBaseAreaOptions = ['天字笼', '地字笼']
const oldBaseRowOptions = Array.from({ length: 10 }, function(_, index) {
  return `第${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][index]}排`
})
const catDormOptions = ['猫猫宿舍一', '猫猫宿舍二', '猫猫宿舍三']
const number30Options = createNumberOptions(30)
const number50Options = createNumberOptions(50)

const initialForm = {
  cover: '',
  images: [],
  isBase: false,
  canWalk: false,
  baseSite: '',
  baseArea: '',
  baseNumber: '',
  baseLocationLabel: '',
  name: '',
  type: '猫咪',
  breed: '',
  age: '',
  gender: '母',
  healthStatus: '无疾病',
  diseaseInfo: '',
  vaccinated: '已接种',
  locationInfo: '',
  location: '',
  intro: '',
  contact: ''
}

Page({
  data: {
    typeOptions: ['猫咪', '狗狗'],
    genderOptions: ['母', '公', '未知'],
    healthStatusOptions: ['无疾病', '治疗中', '生病中', '未知'],
    vaccinatedOptions: ['已接种', '未接种', '未完整接种', '不确定'],
    dogBaseOptions,
    catDormOptions,
    baseAreaOptions: catDormOptions,
    baseNumberOptions: number30Options,
    baseSiteIndex: 0,
    baseAreaIndex: 0,
    baseNumberIndex: 0,
    typeIndex: 0,
    genderIndex: 0,
    healthStatusIndex: 0,
    vaccinatedIndex: 0,
    agreed: false,
    form: JSON.parse(JSON.stringify(initialForm))
  },
  chooseImage() {
    const restCount = 9 - this.data.form.images.length
    if (restCount <= 0) {
      wx.showToast({ title: '最多上传9张照片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: restCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      success: function(res) {
        const nextImages = this.data.form.images.concat(res.tempFiles.map(function(file) {
          return file.tempFilePath
        })).slice(0, 9)
        this.setData({
          'form.images': nextImages,
          'form.cover': this.data.form.cover || nextImages[0] || ''
        })
      }.bind(this)
    })
  },
  previewImage(event) {
    const url = event.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.form.images
    })
  },
  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    const images = this.data.form.images.filter(function(_, currentIndex) {
      return currentIndex !== index
    })
    this.setData({
      'form.images': images,
      'form.cover': images.includes(this.data.form.cover) ? this.data.form.cover : images[0] || ''
    })
  },
  cropCover(event) {
    const image = event.currentTarget.dataset.url
    wx.navigateTo({
      url: '/pages/cover-crop/cover-crop?image=' + encodeURIComponent(image)
    })
  },
  toggleBase() {
    const isBase = !this.data.form.isBase
    const type = this.data.form.type
    if (!isBase) {
      this.setData({
        'form.isBase': false,
        'form.canWalk': false,
        'form.baseSite': '',
        'form.baseArea': '',
        'form.baseNumber': '',
        'form.baseLocationLabel': ''
      })
      return
    }
    const isDog = type === '狗狗'
    const baseSite = isDog ? dogBaseOptions[0] : '猫猫宿舍'
    const baseAreaOptions = isDog ? oldBaseRowOptions : catDormOptions
    const baseArea = baseAreaOptions[0]
    const baseNumber = number30Options[0]
    this.setData({
      'form.isBase': true,
      'form.canWalk': false,
      'form.baseSite': baseSite,
      'form.baseArea': baseArea,
      'form.baseNumber': baseNumber,
      'form.baseLocationLabel': `${baseSite} · ${baseArea} · ${baseNumber}`,
      baseAreaOptions,
      baseNumberOptions: number30Options,
      baseSiteIndex: 0,
      baseAreaIndex: 0,
      baseNumberIndex: 0
    })
  },
  toggleCanWalk() {
    this.setData({
      'form.canWalk': !this.data.form.canWalk
    })
  },
  onInput(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ ['form.' + key]: event.detail.value })
  },
  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed })
  },
  openAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' })
  },
  openPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' })
  },
  onTypeChange(event) {
    const typeIndex = event.detail.index
    const type = this.data.typeOptions[typeIndex]
    const nextData = {
      typeIndex,
      'form.type': type,
      'form.canWalk': false
    }
    if (this.data.form.isBase) {
      const isDog = type === '狗狗'
      const baseSite = isDog ? dogBaseOptions[0] : '猫猫宿舍'
      const baseAreaOptions = isDog ? oldBaseRowOptions : catDormOptions
      const baseArea = baseAreaOptions[0]
      const baseNumber = number30Options[0]
      Object.assign(nextData, {
        'form.baseSite': baseSite,
        'form.baseArea': baseArea,
        'form.baseNumber': baseNumber,
        'form.baseLocationLabel': `${baseSite} · ${baseArea} · ${baseNumber}`,
        baseAreaOptions,
        baseNumberOptions: number30Options,
        baseSiteIndex: 0,
        baseAreaIndex: 0,
        baseNumberIndex: 0
      })
    }
    this.setData({
      ...nextData
    })
  },
  onBaseSiteChange(event) {
    const baseSiteIndex = Number(event.detail.index)
    const baseSite = dogBaseOptions[baseSiteIndex]
    const isNewBase = baseSite === '新基地'
    const baseAreaOptions = isNewBase ? oldBaseRowOptions : newBaseAreaOptions
    const baseNumberOptions = isNewBase ? number30Options : number50Options
    const baseArea = baseAreaOptions[0]
    const baseNumber = baseNumberOptions[0]
    this.setData({
      baseSiteIndex,
      baseAreaIndex: 0,
      baseNumberIndex: 0,
      baseAreaOptions,
      baseNumberOptions,
      'form.baseSite': baseSite,
      'form.baseArea': baseArea,
      'form.baseNumber': baseNumber,
      'form.baseLocationLabel': `${baseSite} · ${baseArea} · ${baseNumber}`
    })
  },
  onBaseAreaChange(event) {
    const baseAreaIndex = Number(event.detail.index)
    const baseArea = this.data.baseAreaOptions[baseAreaIndex]
    const baseSite = this.data.form.baseSite
    const baseNumber = this.data.form.baseNumber
    this.setData({
      baseAreaIndex,
      'form.baseArea': baseArea,
      'form.baseLocationLabel': `${baseSite} · ${baseArea} · ${baseNumber}`
    })
  },
  onBaseNumberChange(event) {
    const baseNumberIndex = Number(event.detail.value)
    const baseNumber = this.data.baseNumberOptions[baseNumberIndex]
    const baseSite = this.data.form.baseSite
    const baseArea = this.data.form.baseArea
    this.setData({
      baseNumberIndex,
      'form.baseNumber': baseNumber,
      'form.baseLocationLabel': `${baseSite} · ${baseArea} · ${baseNumber}`
    })
  },
  onGenderChange(event) {
    const genderIndex = event.detail.index
    this.setData({
      genderIndex,
      'form.gender': this.data.genderOptions[genderIndex]
    })
  },
  onHealthStatusChange(event) {
    const healthStatusIndex = event.detail.index
    const healthStatus = this.data.healthStatusOptions[healthStatusIndex]
    this.setData({
      healthStatusIndex,
      'form.healthStatus': healthStatus
    })
  },
  chooseLocation() {
    wx.chooseLocation({
      success: function(res) {
        this.setData({
          'form.locationInfo': res.name || res.address || '',
          'form.location': res.latitude + ',' + res.longitude
        })
      }.bind(this),
      fail: function() {
        wx.showToast({ title: '定位失败，请手动输入位置', icon: 'none' })
      }
    })
  },
  onVaccinatedChange(event) {
    const vaccinatedIndex = event.detail.index
    this.setData({
      vaccinatedIndex,
      'form.vaccinated': this.data.vaccinatedOptions[vaccinatedIndex]
    })
  },
  async submit() {
    const user = store.getUser()
    if (!user) {
      wx.showModal({
        title: '请先登录',
        content: '登录后可以发布并管理自己的领养信息。',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) wx.navigateTo({ url: '/pages/login/login' })
        }
      })
      return
    }
    const form = this.data.form
    const required = ['name', 'breed', 'age', 'intro', 'contact']
    const missed = required.some(function(key) {
      return !String(form[key]).trim()
    })
    if (missed) {
      wx.showToast({ title: '请补全必填信息', icon: 'none' })
      return
    }
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意协议', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发布中' })
    try {
      const uploadedImages = form.images.length
        ? await store.uploadAdoptionImages(form.images)
        : ['https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80']
      const uploadedCover = form.cover
        ? await store.uploadAdoptionImage(form.cover)
        : uploadedImages[0]
      const result = await store.addAdoption({
        ...form,
        images: uploadedImages,
        cover: uploadedCover
      })
      wx.hideLoading()
      if (result && result.ok === false) {
        wx.showToast({ title: result.message || '发布失败', icon: 'none' })
        return
      }
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(function() {
        wx.switchTab({ url: '/pages/adopt/adopt' })
      }, 500)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    }
  }
})
