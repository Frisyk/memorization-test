import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const audioUrl = url.searchParams.get("url");

  if (!audioUrl) {
    return NextResponse.json(
      { error: "Missing 'url' parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch the actual audio file from the external URL
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch audio from source: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the audio file as arrayBuffer
    const audioData = await response.arrayBuffer();
    
    // Get content type from original response
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    
    // Return the audio file with appropriate headers
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Optional caching
      },
    });
  } catch (error) {
    console.error("Audio proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy audio file" },
      { status: 500 }
    );
  }
}