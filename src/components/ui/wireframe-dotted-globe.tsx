"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import worldDots from "../../assets/data/world-dots.json"

interface RotatingEarthProps {
    width?: number
    height?: number
    className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d", { alpha: true })
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

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([containerWidth / 2, containerHeight / 2])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)

        const render = () => {
            if (!context) return
            context.clearRect(0, 0, containerWidth, containerHeight)

            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            // Draw globe sphere (subtle background)
            context.beginPath()
            context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
            context.fillStyle = "#ffffff"
            context.fill()
            context.strokeStyle = "#f1f5f9"
            context.lineWidth = 1 * scaleFactor
            context.stroke()

            // Draw graticule
            const graticule = d3.geoGraticule()()
            context.beginPath()
            path(graticule as any) // Type cast for d3-geo
            context.strokeStyle = "#e2e8f0"
            context.lineWidth = 0.5 * scaleFactor
            context.globalAlpha = 0.2
            context.stroke()
            context.globalAlpha = 1

            // Draw pre-calculated dots
            context.fillStyle = "#94a3b8"

            // Using a simple loop is faster for large arrays
            for (let i = 0; i < worldDots.length; i++) {
                const dot = worldDots[i] as [number, number]
                // D3 rotation and projection
                const projected = projection(dot)

                if (projected) {
                    const [x, y] = projected
                    // Basic clipping check (D3 clipAngle handles the back of the globe)
                    context.beginPath()
                    context.arc(x, y, 1 * scaleFactor, 0, 2 * Math.PI)
                    context.fill()
                }
            }
        }

        // Set up rotation and interaction
        let rotation: [number, number, number] = [0, 0, 0]
        let autoRotate = true
        const rotationSpeed = 0.3

        const rotate = () => {
            if (autoRotate) {
                rotation[0] += rotationSpeed
                projection.rotate(rotation)
                render()
            }
        }

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
                setTimeout(() => { autoRotate = true }, 10)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        canvas.addEventListener("mousedown", handleMouseDown)

        // Initial render
        render()
        setIsLoading(false)

        return () => {
            rotationTimer.stop()
            canvas.removeEventListener("mousedown", handleMouseDown)
        }
    }, [width, height])

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-auto bg-transparent transition-opacity duration-700"
                style={{ maxWidth: "100%", height: "auto", opacity: isLoading ? 0 : 1 }}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 tracking-[0.2em] uppercase whitespace-nowrap pointer-events-none">
                Interactive Neural Globe
            </div>
        </div>
    )
}
