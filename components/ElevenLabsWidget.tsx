const ElevenLabsWidget = () => {
  const agentId = "agent_2901kg6r4ktrf7wvwa4mn4txgs49";
  const ConvAiElement = 'elevenlabs-convai' as any;

  return (
    <ConvAiElement 
      agent-id={agentId} 
      data-position="left-bottom" 
    />
  );
};

export default ElevenLabsWidget;
