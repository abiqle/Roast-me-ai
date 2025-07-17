"use client"
import { useState } from "react"
import "../styles/roast.css"

export default function RoastForm() {
  const [input, setInput] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [roast, setRoast] = useState("")
  const [roastType, setRoastType] = useState("savage")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 512
          const scaleSize = MAX_WIDTH / img.width
          canvas.width = MAX_WIDTH
          canvas.height = img.height * scaleSize

          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const base64 = canvas.toDataURL("image/jpeg", 0.8)
            resolve(base64)
          }
        }
        if (e.target?.result) {
          img.src = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRoast = async () => {
    if (!image) return alert("Please upload an image!")
    setRoast("")
    setLoading(true)

    try {
      const resizedBase64 = await resizeImage(image)

      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: resizedBase64,
          roastType,
          prompt: input || "",
        }),
      })

      const data = await res.json()
      setRoast(data.roast || "⚠️ No roast received. Try again.")
    } catch (error) {
      console.error("Roast Failed:", error)
      setRoast("❌ Roast failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setInput("")
    setImage(null)
    setPreviewUrl("")
    setRoast("")
    setRoastType("savage")
  }

  return (
    <div className="roast-container">
      <h1 className="title">ROAST AI</h1>

      <label htmlFor="file">Upload Image</label>
      <input type="file" id="file" accept="image/*" onChange={handleFileChange} />

      {previewUrl && (
        <div className="preview-wrapper">
          <p className="preview-label">Image Preview</p>
          <img src={previewUrl} alt="preview" className="preview-img" />
        </div>
      )}

      <label htmlFor="roastType">Roast Type</label>
      <select
        id="roastType"
        value={roastType}
        onChange={(e) => setRoastType(e.target.value)}
      >
        <option value="savage">🔥 Savage</option>
        <option value="nerdy">🤓 Nerdy</option>
        <option value="meme">😂 Meme</option>
        <option value="shakespearean">🎭 Shakespearean</option>
      </select>

      <label htmlFor="input">Custom Prompt (Optional)</label>
      <input
        type="text"
        id="input"
        value={input}
        placeholder="e.g. roast my swag"
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="button-row">
        <button onClick={handleRoast} disabled={loading}>
          {loading ? "Roasting... 🔥" : "ROAST ME ►"}
        </button>
        <button onClick={handleReset}>RESET</button>
      </div>

      {roast && (
        <div className="output">
          <p>{roast}</p>
        </div>
      )}

      <footer>@ABIQLE</footer>
    </div>
  )
}
