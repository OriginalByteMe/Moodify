"use client"

import { useParams } from "next/navigation"
import PlayClient from "./PlayClient"

export default function PlayPage() {
  const params = useParams() as { id: string }
  return <PlayClient trackId={params.id} />
}
