export const compressPhoto = (file) => {
  return new Promise((resolve) => {
    const MAX = 1200
    const QUALITY = 0.75
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round(height * MAX / width)
            width = MAX
          } else {
            width = Math.round(width * MAX / height)
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', QUALITY))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
