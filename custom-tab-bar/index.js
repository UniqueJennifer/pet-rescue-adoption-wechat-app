Component({
  data: {
    selected: 0,
    tabs: [
      {
        pagePath: '/pages/home/home',
        text: '首页'
      },
      {
        pagePath: '/pages/adopt/adopt',
        text: '领养'
      },
      {
        pagePath: '/pages/walk/walk',
        text: '遛狗'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的'
      }
    ]
  },
  methods: {
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      const tab = this.data.tabs[index]
      if (!tab || index === this.data.selected) return
      wx.switchTab({ url: tab.pagePath })
    }
  }
})