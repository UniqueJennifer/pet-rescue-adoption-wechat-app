Component({
  properties: {
    options: {
      type: Array,
      value: []
    },
    selectedIndex: {
      type: Number,
      value: 0
    },
    placeholder: {
      type: String,
      value: '请选择'
    }
  },
  data: {
    showOptions: false
  },
  methods: {
    toggleOptions() {
      this.setData({
        showOptions: !this.data.showOptions
      })
    },
    selectOption(event) {
      const index = Number(event.currentTarget.dataset.index)
      this.setData({
        selectedIndex: index,
        showOptions: false
      })
      this.triggerEvent('change', { index, value: this.properties.options[index] })
    }
  }
})