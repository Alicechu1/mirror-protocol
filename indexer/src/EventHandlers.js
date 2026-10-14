// MIRROR Protocol Envio Indexer — Event Handlers
//
// Indexes all events from PersonaBaseline, AgentRegistry,
// ActionAttestor, and ZKActionAttestor on Monad Testnet.

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

export async function handleBaselineRegistered(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    user: event.params.user,
    commitmentHash: event.params.commitmentHash,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.BaselineRegistered.set(entity);

  const stats = await getOrCreateStats(context);
  stats.totalBaselines += 1;
  await context.db.ProtocolStats.set(stats);
}

export async function handleBaselineUpdated(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    user: event.params.user,
    newCommitmentHash: event.params.newCommitmentHash,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.BaselineUpdated.set(entity);
}

// ===== AgentRegistry =====

export async function handleAgentRegistered(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    agent: event.params.agent,
    owner: event.params.owner,
    persona: event.params.persona,
    generationId: event.params.generationId,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.AgentRegistered.set(entity);

  const stats = await getOrCreateStats(context);
  stats.totalAgents += 1;
  await context.db.ProtocolStats.set(stats);
}

export async function handleAgentAuthorizationChanged(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    agent: event.params.agent,
    isAuthorized: event.params.isAuthorized,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.AgentAuthorizationChanged.set(entity);
}

// ===== ActionAttestor =====

export async function handleActionAttested(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    attestationId: event.params.id,
    agent: event.params.agent,
    actionHash: event.params.actionHash,
    isVerified: event.params.isVerified,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.ActionAttested.set(entity);

  const stats = await getOrCreateStats(context);
  stats.totalAttestations += 1;
  if (!event.params.isVerified) {
    stats.totalViolations += 1;
  }
  await context.db.ProtocolStats.set(stats);
}

export async function handleCircuitBreakerTriggered(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    agent: event.params.agent,
    attestationId: event.params.attestationId,
    reason: event.params.reason,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.CircuitBreakerTriggered.set(entity);
}

// ===== ZKActionAttestor =====

export async function handleZKActionAttested(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    attestationId: event.params.id,
    agent: event.params.agent,
    actionHash: event.params.actionHash,
    baselineCommitment: event.params.baselineCommitment,
    actionCommitment: event.params.actionCommitment,
    compliant: event.params.compliant,
    timestamp: event.params.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.ZKActionAttested.set(entity);

  const stats = await getOrCreateStats(context);
  stats.totalZKAttestations += 1;
  if (!event.params.compliant) {
    stats.totalZKViolations += 1;
  }
  await context.db.ProtocolStats.set(stats);
}

export async function handleZKVerificationRejected(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    agent: event.params.agent,
    baselineCommitment: event.params.baselineCommitment,
    actionCommitment: event.params.actionCommitment,
    reason: event.params.reason,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.ZKVerificationRejected.set(entity);
}

export async function handleZKCircuitBreakerTriggered(event, context) {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    agent: event.params.agent,
    attestationId: event.params.id,
    violations: event.params.violations,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };
  await context.db.ZKCircuitBreakerTriggered.set(entity);
}
