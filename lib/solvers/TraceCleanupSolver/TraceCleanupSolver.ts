/**
 * Process a single trace with obstacle-aware context
 */
private _processTrace(step: "minimizing_turns" | "balancing_l_shapes") {
  const targetMspConnectionPairId = this.traceIdQueue.shift()!
  this.activeTraceId = targetMspConnectionPairId

  const originalTrace = this.tracesMap.get(targetMspConnectionPairId)!
  if (!originalTrace) return

  // Skip unnecessary cleanup
  if (is4PointRectangle(originalTrace.tracePath)) {
    return
  }

  // Build obstacle-aware context
  const allOtherTraces = Array.from(this.tracesMap.values()).filter(
    (t) => t.mspPairId !== targetMspConnectionPairId
  )

  const cleanupInput = {
    ...this.input,
    targetMspConnectionPairId,
    traces: allOtherTraces,
    obstacles: allOtherTraces.map((t) => ({
      points: t.tracePath
    }))
  }

  let updatedTrace: SolvedTracePath

  if (step === "minimizing_turns") {
    updatedTrace = minimizeTurnsWithFilteredLabels(cleanupInput)
  } else {
    updatedTrace = balanceZShapes(cleanupInput)
  }

  // Store updated trace
  this.tracesMap.set(targetMspConnectionPairId, updatedTrace)
  this.outputTraces = Array.from(this.tracesMap.values())
}
