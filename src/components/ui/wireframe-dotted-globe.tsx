"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface RotatingEarthProps {
    width?: number
    height?: number
    className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        // Set up responsive dimensions
        const containerWidth = Math.min(width, window.innerWidth - 40)
        const containerHeight = Math.min(height, window.innerHeight - 100)
        const radius = Math.min(containerWidth, containerHeight) / 2.5

        const dpr = window.devicePixelRatio || 1
        canvas.width = containerWidth * dpr
        canvas.height = containerHeight * dpr
        canvas.style.width = `${containerWidth}px`
        canvas.style.height = `${containerHeight}px`
        context.scale(dpr, dpr)

        // Create projection and path generator for Canvas
        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([containerWidth / 2, containerHeight / 2])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)

        const pointInPolygon = (point: [number, number], polygon: any[]): boolean => {
            const [x, y] = point
            let inside = false

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const [xi, yi] = polygon[i]
                const [xj, yj] = polygon[j]

                if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                    inside = !inside
                }
            }

            return inside
        }

        const pointInFeature = (point: [number, number], feature: any): boolean => {
            const geometry = feature.geometry
            if (!geometry) return false

            if (geometry.type === "Polygon") {
                const coordinates = geometry.coordinates
                if (!coordinates || coordinates.length === 0) return false
                // Check if point is in outer ring
                if (!pointInPolygon(point, coordinates[0])) {
                    return false
                }
                // Check if point is in any hole (inner rings)
                for (let i = 1; i < coordinates.length; i++) {
                    if (pointInPolygon(point, coordinates[i])) {
                        return false // Point is in a hole
                    }
                }
                return true
            } else if (geometry.type === "MultiPolygon") {
                const multiCoords = geometry.coordinates
                if (!multiCoords) return false
                // Check each polygon in the MultiPolygon
                for (const polygon of multiCoords) {
                    // Check if point is in outer ring
                    if (pointInPolygon(point, polygon[0])) {
                        // Check if point is in any hole
                        let inHole = false
                        for (let i = 1; i < polygon.length; i++) {
                            if (pointInPolygon(point, polygon[i])) {
                                inHole = true
                                break
                            }
                        }
                        if (!inHole) {
                            return true
                        }
                    }
                }
                return false
            }

            return false
        }

        const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
            const dots: [number, number][] = []
            const bounds = d3.geoBounds(feature)
            const [[minLng, minLat], [maxLng, maxLat]] = bounds

            const stepSize = dotSpacing * 0.08

            for (let lng = minLng; lng <= maxLng; lng += stepSize) {
                for (let lat = minLat; lat <= maxLat; lat += stepSize) {
                    const point: [number, number] = [lng, lat]
                    if (pointInFeature(point, feature)) {
                        dots.push(point)
                    }
                }
            }

            return dots
        }

        interface DotData {
            lng: number
            lat: number
            visible: boolean
        }

        const allDots: DotData[] = []
        let landFeatures: any = null

        const render = () => {
            if (!context) return
            // Clear canvas
            context.clearRect(0, 0, containerWidth, containerHeight)

            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            // Draw ocean (globe background)
            context.beginPath()
            context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
            context.fillStyle = "#ffffff"
            context.fill()
            context.strokeStyle = "#e2e8f0"
            context.lineWidth = 1 * scaleFactor
            context.stroke()

            if (landFeatures) {
                // Draw graticule
                const graticule = d3.geoGraticule()
                context.beginPath()
                path(graticule() as any)
                context.strokeStyle = "#cbd5e1"
                context.lineWidth = 0.5 * scaleFactor
                context.globalAlpha = 0.3
                context.stroke()
                context.globalAlpha = 1

                // Draw halftone dots
                allDots.forEach((dot) => {
                    const projected = projection([dot.lng, dot.lat])
                    if (
                        projected &&
                        projected[0] >= 0 &&
                        projected[0] <= containerWidth &&
                        projected[1] >= 0 &&
                        projected[1] <= containerHeight
                    ) {
                        context.beginPath()
                        context.arc(projected[0], projected[1], 1 * scaleFactor, 0, 2 * Math.PI)
                        context.fillStyle = "#94a3b8"
                        context.fill()
                    }
                })
            }
        }

        const loadWorldData = async () => {
            try {
                setIsLoading(true)

                const response = await fetch(
                    "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
                )
                if (!response.ok) throw new Error("Failed to load land data")

                const data = await response.json()
                landFeatures = data

                if (data && data.features) {
                    // Generate dots for all land features
                    data.features.forEach((feature: any) => {
                        const dots = generateDotsInPolygon(feature, 16)
                        dots.forEach(([lng, lat]) => {
                            allDots.push({ lng, lat, visible: true })
                        })
                    })
                }

                render()
                setIsLoading(false)
            } catch (err) {
                setError("Failed to load land map data")
                setIsLoading(false)
            }
        }

        // Set up rotation and interaction
        let rotation: [number, number, number] = [0, 0, 0]
        let autoRotate = true
        const rotationSpeed = 0.2

        const rotate = () => {
            if (autoRotate) {
                rotation[0] += rotationSpeed
                projection.rotate(rotation)
                render()
            }
        }

        // Auto-rotation timer
        const rotationTimer = d3.timer(rotate)

        const handleMouseDown = (event: MouseEvent) => {
            autoRotate = false
            const startX = event.clientX
            const startY = event.clientY
            const startRotation = [...rotation] as [number, number, number]

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const sensitivity = 0.25
                const dx = moveEvent.clientX - startX
                const dy = moveEvent.clientY - startY

                rotation[0] = startRotation[0] + dx * sensitivity
                rotation[1] = startRotation[1] - dy * sensitivity
                rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

                projection.rotate(rotation)
                render()
            }

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)

                setTimeout(() => {
                    autoRotate = true
                }, 10)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        canvas.addEventListener("mousedown", handleMouseDown)

        // Load the world data
        loadWorldData()

        // Cleanup
        return () => {
            rotationTimer.stop()
            canvas.removeEventListener("mousedown", handleMouseDown)
        }
    }, [width, height])

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-white rounded-2xl p-8 ${className}`}>
                <div className="text-center">
                    <p className="text-red-500 font-semibold mb-2">Error loading Earth visualization</p>
                    <p className="text-slate-400 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-auto bg-transparent transition-opacity duration-1000"
                style={{ maxWidth: "100%", height: "auto", opacity: isLoading ? 0 : 1 }}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 tracking-[0.2em] uppercase whitespace-nowrap">
                Interactive Neural Globe
            </div>
        </div>
    )
}
