const store = require('../../utils/store')

function syncTabBar(page, selected) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected })
  }
}

Page({
  data: {
    dogs: [],
    dates: [],
    months: [],
    days: [],
    times: [],
    location: '',
    shelterPhone: '',
    selectedDogId: '',
    monthIndex: 0,
    dayIndex: 0,
    dateIndex: 0,
    timeIndex: 0,
    visitorName: '',
    phone: '',
    bookings: []
  },
  async onShow() {
    syncTabBar(this, 2)
    const navigationTarget = wx.getStorageSync('home_walk_target')
    if (navigationTarget) wx.removeStorageSync('home_walk_target')
    const baseDogs = await store.getShelterDogs()
    const adoptions = await store.getAdoptions()
    const walkableBaseDogs = adoptions.filter(function(item) {
      return item.type === '狗狗' && item.isBase === true && item.canWalk === true
    }).map(function(item) {
      return {
        id: item.id || item._id,
        name: item.name,
        size: item.breed || '未知品种',
        temperament: item.healthStatus || '健康',
        note: '基地待领养狗狗',
        cover: item.cover
      }
    })
    const dogs = baseDogs.concat(walkableBaseDogs)
    const user = store.getUser()
    const dates = store.getWalkDates()
    const selectedDate = dates[this.data.dateIndex] || dates[0]
    const months = this.getMonthOptions(dates)
    const monthIndex = Math.max(months.findIndex(function(month) {
      return month.value === selectedDate.month
    }), 0)
    const days = this.getDayOptions(dates, selectedDate && selectedDate.month)
    const dayIndex = Math.max(days.findIndex(function(day) {
      return day.value === selectedDate.value
    }), 0)
    const bookings = await store.getBookingsForUser(user && user.id)
    this.setData({
      dogs,
      dates,
      months,
      days,
      monthIndex,
      dayIndex,
      times: store.getTimeSlots(),
      location: store.getWalkLocation(),
      shelterPhone: store.getShelterPhone(),
      selectedDogId: (navigationTarget && navigationTarget.dogId) || this.data.selectedDogId || (dogs[0] && dogs[0].id) || '',
      visitorName: this.data.visitorName || (user && user.nickname) || '',
      phone: this.data.phone || (user && user.phone) || '',
      bookings
    }, function() {
      if (navigationTarget && navigationTarget.showBookings) {
        wx.nextTick(function() {
          wx.pageScrollTo({ selector: '#booking-section', duration: 240 })
        })
      }
    })
  },
  getMonthOptions(dates) {
    const months = []
    dates.forEach(function(date) {
      if (!months.some(function(item) {
        return item.value === date.month
      })) {
        months.push({
          value: date.month,
          label: date.monthLabel
        })
      }
    })
    return months
  },
  getDayOptions(dates, month) {
    return dates
      .filter(function(date) {
        return date.month === month
      })
      .map(function(date) {
        return {
          value: date.value,
          month: date.month,
          day: date.day,
          label: date.dayLabel
        }
      })
  },
  selectDog(event) {
    this.setData({ selectedDogId: event.currentTarget.dataset.id })
  },
  onMonthChange(event) {
    const monthIndex = Number(event.detail.value)
    const month = this.data.months[monthIndex].value
    const days = this.getDayOptions(this.data.dates, month)
    const dateIndex = this.data.dates.findIndex(function(date) {
      return date.value === days[0].value
    })
    this.setData({
      monthIndex,
      dayIndex: 0,
      days,
      dateIndex
    })
  },
  onDayChange(event) {
    const dayIndex = Number(event.detail.value)
    const selectedDay = this.data.days[dayIndex]
    const dateIndex = this.data.dates.findIndex(function(date) {
      return date.value === selectedDay.value
    })
    this.setData({
      dayIndex,
      dateIndex
    })
  },
  onTimeChange(event) {
    this.setData({ timeIndex: Number(event.detail.value) })
  },
  onNameInput(event) {
    this.setData({ visitorName: event.detail.value })
  },
  onPhoneInput(event) {
    this.setData({ phone: event.detail.value })
  },
  async submit() {
    const selectedDogId = this.data.selectedDogId
    const dates = this.data.dates
    const times = this.data.times
    const dateIndex = this.data.dateIndex
    const timeIndex = this.data.timeIndex
    const visitorName = this.data.visitorName
    const phone = this.data.phone
    const user = store.getUser()
    if (!user) {
      wx.showModal({
        title: '请先登录',
        content: '登录后可以预约遛狗并查看自己的预约记录。',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) wx.navigateTo({ url: '/pages/login/login' })
        }
      })
      return
    }
    if (!selectedDogId) {
      wx.showToast({ title: '请选择小狗', icon: 'none' })
      return
    }
    if (!visitorName.trim() || !phone.trim()) {
      wx.showToast({ title: '请填写预约人和手机号', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }
    const selectedDate = dates[dateIndex]
    wx.showLoading({ title: '提交中' })
    const result = await store.addBooking({
      dogId: selectedDogId,
      date: selectedDate.value,
      dateLabel: selectedDate.label,
      time: times[timeIndex],
      visitorName,
      phone
    })
    wx.hideLoading()
    if (!result.ok) {
      wx.showToast({ title: result.message, icon: 'none' })
      return
    }
    wx.showModal({
      title: '提交成功',
      content: '预约申请已提交，等待管理员审批。审批完成后会在首页"我的预约"中显示。',
      showCancel: false,
      confirmText: '知道了',
      success: async function() {
        this.setData({
          bookings: await store.getBookingsForUser(user.id)
        })
      }.bind(this)
    })
  }
})
