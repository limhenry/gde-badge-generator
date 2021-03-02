import React from "react"
import "./style.css"

class Home extends React.Component {

  uploadImage = () => {
    document.querySelector('input.profile-input').click()
  }

  upload = (e) => {
    if (e && e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          this.image = img
          this.draw()
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  draw = () => {
    const category = document.querySelector('input.category-input').value || 'Category Name'

    if (this.image) {
      this.canvas.width = 500
      this.canvas.height = 500
      const hRatio = this.canvas.width / this.image.width
      const vRatio = this.canvas.height / this.image.height
      const ratio  = Math.max ( hRatio, vRatio )
      const x = ( this.canvas.width - this.image.width * ratio ) / 2
      const y = ( this.canvas.height - this.image.height * ratio ) / 2
      this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, this.image.width * ratio, this.image.height * ratio)
    }
    else {
      this.ctx.canvas.width = 500
      this.ctx.canvas.height = 500
      this.ctx.fillStyle = '#0d47a1'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    const height = this.banner.height / this.banner.width * this.canvas.width
    const y = this.canvas.height - height
    const fontSize = this.canvas.width / 17.2
    const fontY = y + height * 0.7
    this.ctx.drawImage(this.banner, 0, 0, this.banner.width, this.banner.height, 0, y, this.canvas.width, height)

    this.ctx.fillStyle = '#757575'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.font = `${fontSize}px Google Sans, sans-serif`
    this.ctx.fillText(category, this.canvas.width / 2, fontY)
  }

  download = () => {
    const a = document.createElement('a')
    const url = this.canvas.toDataURL('image/png;base64')
    a.download = 'badge.png'
    a.href = url
    a.click()
  }

  componentDidMount () {
    this.canvas = document.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.banner = new Image()
    this.banner.src = './experts.svg'
    this.banner.onload = () => {
      this.draw()
    }
  }

  render () {
    return (
      <div id="app">
        <header>
          <div className="title">GDE Profile Badge Generator</div>
        </header>

        <div className="main-container">
          <div className="input-panel">
            <div className="input">
              <label htmlFor="file">Profile Picture</label>
              <button id="file" className="button" onClick={this.uploadImage}>Upload Image</button>
              <input className="profile-input" type="file" accept="image/*" onChange={this.upload} hidden />
            </div>
            <div className="input">
              <label htmlFor="category">Category Name</label>
              <input id="category" list="gde-category" className="category-input" type="text" onInput={this.draw} />
              <datalist id="gde-category">
                <option value="Android" aria-label="Android" />
                <option value="Angular" aria-label="Angular" />
                <option value="Assistant" aria-label="Assistant" />
                <option value="Dart" aria-label="Dart"/>
                <option value="Firebase" aria-label="Firebase"/>
                <option value="Flutter" aria-label="Flutter" />
                <option value="G Suite" aria-label="G Suite" />
                <option value="Go" aria-label="Go" />
                <option value="Google Cloud" aria-label="Google Cloud" />
                <option value="Google Maps" aria-label="Google Maps" />
                <option value="IoT" aria-label="IoT" />
                <option value="Kotlin" aria-label="Kotlin" />
                <option value="Machine Learning" aria-label="Machine Learning" />
                <option value="Payments" aria-label="Payments" />
                <option value="Web" aria-label="Web" />
              </datalist>
            </div>
          </div>
          <div className="preview-panel">
            <canvas></canvas>
            <div className="download-fab" onClick={this.download} onKeyDown={this.download} role="button" tabIndex="0">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#fff">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M16.59 9H15V4c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v5H7.41c-.89 0-1.34 1.08-.71 1.71l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.63-.63.19-1.71-.7-1.71zM5 19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  };
}

export default Home;