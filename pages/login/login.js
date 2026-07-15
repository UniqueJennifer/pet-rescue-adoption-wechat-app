const store = require('../../utils/store')

Page({
  data: {
    mode: 'phone',
    nickname: '',
    phone: '',
    avatar: ''
  },
  changeMode(event) {
    this.setData({ mode: event.currentTarget.dataset.mode })
  },
  onNicknameInput(event) {
    this.setData({ nickname: event.detail.value })
  },
  onPhoneInput(event) {
    this.setData({ phone: event.detail.value })
  },
  onChooseAvatar(event) {
    this.setData({ avatar: event.detail.avatarUrl })
  },
  goAfterLogin() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1,
        fail: function() {
          wx.switchTab({ url: '/pages/profile/profile' })
        }
      })
      return
    }
    wx.switchTab({ url: '/pages/profile/profile' })
  },
  async loginByPhone() {
    const nickname = this.data.nickname
    const phone = this.data.phone
    if (!nickname.trim() || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请填写昵称和正确手机号', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中' })
    await store.saveUser({ nickname, phone, loginType: 'phone' })
    wx.hideLoading()
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(function() {
      this.goAfterLogin()
    }.bind(this), 400)
  },
  async loginByWechat() {
    const nickname = this.data.nickname
    const phone = this.data.phone
    const avatar = this.data.avatar
    if (!nickname.trim()) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    if (phone && !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中' })
    await store.saveUser({ nickname, phone, avatar, loginType: 'wechat' })
    wx.hideLoading()
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(function() {
      this.goAfterLogin()
    }.bind(this), 400)
  }
})