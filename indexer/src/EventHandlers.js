// MIRROR Protocol Envio Indexer — Event Handlers (V2 CommonJS)
//
// Indexes all events from PersonaBaseline, AgentRegistry,
// ActionAttestor, and ZKActionAttestor on Monad.

const STATS_ID = "singleton";

async function getOrCreateStats(context) {
  let stats = await context.db.ProtocolStats.get(STATS_ID);
  if (!stats) {
    stats = {
      id: STATS_ID,
      totalBaselines: 0,
      totalAgents: 0,
      totalAttestations: 0,
      totalZKAttestations: 0,
      totalViolations: 0,
      totalZKViolations: 0,
    };
    await context.db.ProtocolStats.set(stats);
  }
  return stats;
}

// ===== PersonaBaseline =====

PersonaBaseline.BaselineRegistered.handler(async ({ event, context }) => {
  await context.db.BaselineRegistered.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    commitmentHash: event.params.commitmentHash,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  const stats = await getOrCreateStats(context);
  stats.totalBaselines += 1;
  await context.db.ProtocolStats.set(stats);
});

PersonaBaseline.BaselineUpdated.handler(async ({ event, context }) => {
  await context.db.BaselineUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    newCommitmentHash: event.params.newCommitmentHash,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// ===== AgentRegistry =====

AgentRegistry.AgentRegistered.handler(async ({ event, context }) => {
  await context.db.AgentRegistered.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    agent: event.params.agent,
    owner: event.params.owner,
    persona: event.params.persona,
    generationId: event.params.generationId,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  const stats = await getOrCreateStats(context);
  stats.totalAgents += 1;
  await context.db.ProtocolStats.set(stats);
});

AgentRegistry.AgentAuthorizationChanged.handler(async ({ event, context }) => {
  await context.db.AgentAuthorizationChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    agent: event.params.agent,
    isAuthorized: event.params.isAuthorized,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// ===== ActionAttestor =====

ActionAttestor.ActionAttested.handler(async ({ event, context }) => {
  await context.db.ActionAttested.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    attestationId: event.params.id,
    agent: event.params.agent,
    actionHash: event.params.actionHash,
    isVerified: event.params.isVerified,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  const stats = await getOrCreateStats(context);
  stats.totalAttestations += 1;
  if (!event.params.isVerified) {
    stats.totalViolations += 1;
  }
  await context.db.ProtocolStats.set(stats);
});

ActionAttestor.CircuitBreakerTriggered.handler(async ({ event, context }) => {
  await context.db.CircuitBreakerTriggered.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    agent: event.params.agent,
    attestationId: event.params.attestationId,
    reason: event.params.reason,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// ===== ZKActionAttestor =====

ZKActionAttestor.ZKActionAttested.handler(async ({ event, context }) => {
  await context.db.ZKActionAttested.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    attestationId: event.params.id,
    agent: event.params.agent,
    actionHash: event.params.actionHash,
    baselineCommitment: event.params.baselineCommitment,
    actionCommitment: event.params.actionCommitment,
    compliant: event.params.compliant,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  const stats = await getOrCreateStats(context);
  stats.totalZKAttestations += 1;
  if (!event.params.compliant) {
    stats.totalZKViolations += 1;
  }
  await context.db.ProtocolStats.set(stats);
});

ZKActionAttestor.ZKVerificationRejected.handler(async ({ event, context }) => {
  await context.db.ZKVerificationRejected.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    agent: event.params.agent,
    baselineCommitment: event.params.baselineCommitment,
    actionCommitment: event.params.actionCommitment,
    reason: event.params.reason,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

ZKActionAttestor.ZKCircuitBreakerTriggered.handler(async ({ event, context }) => {
  await context.db.ZKCircuitBreakerTriggered.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    agent: event.params.agent,
    attestationId: event.params.id,
    violations: event.params.violations,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});
