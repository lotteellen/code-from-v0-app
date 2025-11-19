"use client"

import React from "react"

type ColumnWrapper = {
  component?: React.ComponentType<{
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }>
  className?: string
  style?: React.CSSProperties
}

export type ContainerProps = {
  left: React.ReactNode
  middle: React.ReactNode
  right: React.ReactNode
  leftWrapper?: ColumnWrapper
  middleWrapper?: ColumnWrapper
  rightWrapper?: ColumnWrapper
  className?: string
  style?: React.CSSProperties
  gap?: string
  height?: string
}

const DefaultWrapper: React.FC<{
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}> = ({ children, className, style }) => (
  <div className={className} style={style}>
    {children}
  </div>
)

export function Container({
  left,
  middle,
  right,
  leftWrapper,
  middleWrapper,
  rightWrapper,
  className = "",
  style,
  gap = "gap-8",
}: ContainerProps) {
  const LeftWrapper = leftWrapper?.component || DefaultWrapper
  const MiddleWrapper = middleWrapper?.component || DefaultWrapper
  const RightWrapper = rightWrapper?.component || DefaultWrapper

  const containerStyle: React.CSSProperties = {
    ...style,
    height: "300px",
    width: "600px",
    margin: "0 auto",
  }

  const defaultWrapperStyle: React.CSSProperties = {
    width: "33.333%",
  }

  return (
    <div
      className={`flex flex-row ${gap} items-start justify-center w-full flex-nowrap ${className}`}
      style={containerStyle}
    >
      {/* Left column */}
      <LeftWrapper
        className={leftWrapper?.className}
        style={{ ...defaultWrapperStyle, ...leftWrapper?.style }}
      >
        {left}
      </LeftWrapper>

      {/* Middle column */}
      <MiddleWrapper
        className={middleWrapper?.className}
        style={{ ...defaultWrapperStyle, ...middleWrapper?.style }}
      >
        {middle}
      </MiddleWrapper>

      {/* Right column */}
      <RightWrapper
        className={rightWrapper?.className}
        style={{ ...defaultWrapperStyle, ...rightWrapper?.style }}
      >
        {right}
      </RightWrapper>
    </div>
  )
}
