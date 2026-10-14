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
});
