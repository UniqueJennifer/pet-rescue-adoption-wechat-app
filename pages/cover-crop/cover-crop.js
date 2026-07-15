const FRAME_WIDTH_RPX = 660
const FRAME_HEIGHT_RPX = 520

Page({
  data: {
    image: '',
    frameWidth: 330,
    frameHeight: 260,
    imageNaturalWidth: 0,
    imageNaturalHeight: 0,
    imageWidth: 330,
    imageHeight: 260,
    imageLeft: 0,
    imageTop: 0,
    baseWidth: FRAME_WIDTH,
    baseHeight: FRAME_HEIGHT,
    scale: 1,
    lastX: 0,
    lastY: 0
  },
  onLoad(options) {
    const image = decodeURIComponent(options.image || '')
    if (!image) {
      wx.showToast({ title: '缺少图片', icon: 'none' })
      return
    }
    this.setData({ image })
    const systemInfo = wx.getSystemInfoSync()
    const frameWidth = (systemInfo.windowWidth / 750) * FRAME_WIDTH_RPX
    const frameHeight = (systemInfo.windowWidth / 750) * FRAME_HEIGHT_RPX
    this.setData({ frameWidth, frameHeight })
    wx.getImageInfo({
      src: image,
      success: (info) => {
        const imageRatio = info.width / info.height
        const frameRatio = frameWidth / frameHeight
        let baseWidth = frameWidth
        let baseHeight = frameHeight
        if (imageRatio > frameRatio) {
          baseHeight = frameHeight
          baseWidth = frameHeight * imageRatio
        } else {
          baseWidth = frameWidth
          baseHeight = frameWidth / imageRatio
        }
        this.setData({
          imageNaturalWidth: info.width,
          imageNaturalHeight: info.height,
          baseWidth,
          baseHeight,
          imageWidth: baseWidth,
          imageHeight: baseHeight,
          imageLeft: (frameWidth - baseWidth) / 2,
          imageTop: (frameHeight - baseHeight) / 2
        })
      }
    })
  },
  clampPosition(left, top, width, height) {
    const minLeft = Math.min(0, this.data.frameWidth - width)
    const minTop = Math.min(0, this.data.frameHeight - height)
    return {
      left: Math.max(minLeft, Math.min(0, left)),
      top: Math.max(minTop, Math.min(0, top))
    }
  },
  onTouchStart(event) {
    const touch = event.touches[0]
    this.setData({
      lastX: touch.clientX,
      lastY: touch.clientY
    })
  },
  onTouchMove(event) {
    const touch = event.touches[0]
    const dx = touch.clientX - this.data.lastX
    const dy = touch.clientY - this.data.lastY
    const next = this.clampPosition(
      this.data.imageLeft + dx,
      this.data.imageTop + dy,
      this.data.imageWidth,
      this.data.imageHeight
    )
    this.setData({
      imageLeft: next.left,
      imageTop: next.top,
      lastX: touch.clientX,
      lastY: touch.clientY
    })
  },
  onScaleChange(event) {
    const scale = Number(event.detail.value)
    const centerX = this.data.frameWidth / 2
    const centerY = this.data.frameHeight / 2
    const oldWidth = this.data.imageWidth
    const oldHeight = this.data.imageHeight
    const width = this.data.baseWidth * scale
    const height = this.data.baseHeight * scale
    const left = centerX - ((centerX - this.data.imageLeft) / oldWidth) * width
    const top = centerY - ((centerY - this.data.imageTop) / oldHeight) * height
    const next = this.clampPosition(left, top, width, height)
    this.setData({
      scale,
      imageWidth: width,
      imageHeight: height,
      imageLeft: next.left,
      imageTop: next.top
    })
  },
  resetCrop() {
    this.setData({
      scale: 1,
      imageWidth: this.data.baseWidth,
      imageHeight: this.data.baseHeight,
      imageLeft: (this.data.frameWidth - this.data.baseWidth) / 2,
      imageTop: (this.data.frameHeight - this.data.baseHeight) / 2
    })
  },
  saveCrop() {
    const ctx = wx.createCanvasContext('coverCropCanvas', this)
    const outputWidth = 990
    const outputHeight = 780
    const scaleX = outputWidth / this.data.frameWidth
    const scaleY = outputHeight / this.data.frameHeight
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, outputWidth, outputHeight)
    ctx.drawImage(
      this.data.image,
      this.data.imageLeft * scaleX,
      this.data.imageTop * scaleY,
      this.data.imageWidth * scaleX,
      this.data.imageHeight * scaleY
    )
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'coverCropCanvas',
        width: outputWidth,
        height: outputHeight,
        destWidth: outputWidth,
        destHeight: outputHeight,
        fileType: 'jpg',
        quality: 0.92,
        success: (res) => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage) {
            prevPage.setData({
              'form.cover': res.tempFilePath
            })
          }
          wx.navigateBack()
        },
        fail: () => {
          wx.showToast({ title: '裁剪失败', icon: 'none' })
        }
      }, this)
    })
  }
})
