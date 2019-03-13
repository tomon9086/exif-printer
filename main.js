const cvs = document.querySelector("#canvas")
const ctx = cvs.getContext("2d")
const fileobj = document.querySelector("#file")
const colorobj = document.querySelector("#color-picker")
const loading = document.querySelector("#loading-wrapper")

const imgRegex = /^image\/.+/

let img = null
let exifstr = ""
let filename = ""

fileobj.addEventListener("change", e => {
	loading.style.display = "unset"
	img = new Image()
	img.onload = onloadEvent
	const file = e.target.files[0]
	// console.log(file.type)
	if(!file.type.match(imgRegex)) {
		alert(`This file is not a image.`)
		loading.style.display = "none"
		return
	}
	const reader = new FileReader()
	reader.readAsDataURL(file)
	reader.onload = () => {
		img.src = reader.result
		filename = file.name
	}
}, false)
colorobj.addEventListener("change", e => {
	drawText()
}, false)

function onloadEvent() {
	loading.style.display = "none"
	EXIF.getData(img, function() {
		const data = EXIF.getAllTags(this)
		console.log(data)
		const imgsize = {
			width: img.naturalWidth,
			height: img.naturalHeight
		}
		cvs.setAttribute("width", imgsize.width)
		cvs.setAttribute("height", imgsize.height)
		cvs.style.height = cvs.clientWidth * imgsize.height / imgsize.width
		exifstr = ""
		const model = trim(data.Model) || ""
		exifstr += model ? `${model}  ` : ""
		const focalLength = data.FocalLength ? `${data.FocalLength}mm` : ""
		exifstr += focalLength ? `${focalLength}  ` : ""
		const FNumber = data.FNumber ? `F${data.FNumber}` : ""
		exifstr += FNumber ? `${FNumber}  ` : ""
		const exposureTime = data.ExposureTime ? reduceFrac(data.ExposureTime.numerator, data.ExposureTime.denominator) : ""
		exifstr += exposureTime ? `${exposureTime}  ` : ""
		const iso = data.ISOSpeedRatings ? `ISO ${data.ISOSpeedRatings}` : ""
		exifstr += iso ? `${iso}  ` : ""
		const artist = trim(data.Artist)
		const photoby = artist ? `Photo by ${artist}` : ""
		exifstr += photoby || ""
	})
	ctx.drawImage(img, 0, 0)
}
function drawText() {
	ctx.fillStyle = colorobj.value
	const fontsize = cvs.width * 0.016 | 0
	ctx.font = `${fontsize}px 'meiryo', 'Hiragino Kaku Gothic Pro', 'sans-serif'`
	if(!exifstr) {
		alert(`This image contains no available metadata.`)
		return
	}
	ctx.fillText(exifstr, fontsize * 0.7, fontsize * 1.4)
}
function download() {
	// const link = document.createElement("a")
	const linkcontainer = document.querySelector("#download-container")
	// for(let node of linkcontainer.childNodes) {
	// 	console.log(node)
	// 	linkcontainer.removeChild(node)
	// }
	while(linkcontainer.hasChildNodes()) {
		linkcontainer.removeChild(linkcontainer.lastChild)
	}
	const link = document.createElement("a")
	link.innerText = "Click here"
	linkcontainer.appendChild(link)
	const span = document.createElement("span")
	span.innerText = " if the download doesn't start automatically."
	linkcontainer.appendChild(span)
	// link.href = cvs.toDataURL("image/jpeg")
	// link.download = "canvas.png"
	// link.click()
	cvs.toBlob(bin => {
		link.href = URL.createObjectURL(bin)
		link.download = filename || "canvas.jpg"
		link.click()
	}, "image/jpeg")
}
function trim(str) {
	if(!str)
		return ""
	let ret = ""
	for(let char of str.trim())
		ret += char.charCodeAt() ? char : ""
	return ret
}
function reduceFrac(numerator, denominator) {
	numerator = +numerator
	denominator = +denominator
	if(isNaN(numerator) || isNaN(denominator))
		return ""
	if(denominator % numerator === 0) {
		denominator /= numerator
		numerator = 1
	} else if(numerator % denominator === 0) {
		numerator /= denominator
		denominator = 1
	}
	return `${numerator}/${denominator}`
}
