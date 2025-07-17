import "../styles/roast.css"

export default function RoastOutput({ text }: { text: string }) {
  return (
    <div className="roast-output-box">
      <h2 className="roast-output-heading">🤜 Here&apos;s your roast:</h2>
      <p className="roast-output-text">{text}</p>
    </div>
  )
}
