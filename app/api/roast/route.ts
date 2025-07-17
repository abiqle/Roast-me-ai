import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, roastType } = await req.json()

    const replicateApiKey = process.env.REPLICATE_API_KEY
    if (!replicateApiKey) {
      return NextResponse.json({ error: "Replicate API key not found" }, { status: 500 })
    }

    const version = "d8d2bdfd5f29d0e6fc14f81c30b2eb8584dd3e0f4f16a5eb2dbdf08642f54aec" // LLaVA-13B

    const predictionInitRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: {
          image: imageBase64,
          prompt: `Roast this person in a ${roastType} way.`,
        },
      }),
    })

    const predictionInit = await predictionInitRes.json()

    if (predictionInit?.error) {
      console.error("Prediction Init Error:", predictionInit.error)
      return NextResponse.json({ error: predictionInit.error }, { status: 500 })
    }

    let result = predictionInit

    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${replicateApiKey}`,
          "Content-Type": "application/json",
        },
      })

      result = await pollRes.json()
    }

    if (result.status === "succeeded") {
      return NextResponse.json({ roast: result.output })
    } else {
      return NextResponse.json({ error: "Roast failed to complete" }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Roast Error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      console.error("Unknown error:", error)
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
    }
  }
}
