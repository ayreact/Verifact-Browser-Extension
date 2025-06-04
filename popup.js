document.addEventListener('DOMContentLoaded', () => {
  const claimInput = document.getElementById('claimInput');
  const verifyBtn = document.getElementById('verifyBtn');
  const chatArea = document.getElementById('chat-area');
  const welcomeMessage = document.getElementById('welcome-message');
	const externalLinkBtn = document.getElementById('externalLinkBtn');

  // Open external link
  externalLinkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sadiq-teslim.github.io/verifact2' });
  });

  // Enable/disable send button based on input
  claimInput.addEventListener('input', () => {
    verifyBtn.disabled = claimInput.value.trim() === '';
  });

  verifyBtn.addEventListener('click', async () => {
    const userMessage = claimInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    addMessageToChat(userMessage, 'user');
    claimInput.value = '';
    verifyBtn.disabled = true;

    // Remove welcome message if it's the first interaction
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    try {
      const response = await callVerifactAPI(userMessage);
      formatAIResponse(response);
    } catch (error) {
      addMessageToChat("Sorry, I couldn't verify that claim. Please try again later.", 'ai', 'inconclusive');
      console.error('Error:', error);
    }
  });

  // Allow sending with Enter key
  claimInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !verifyBtn.disabled) {
      verifyBtn.click();
    }
  });

  function addMessageToChat(message, sender, verdictType = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (sender === 'ai' && verdictType) {
      messageDiv.classList.add(`verdict-${verdictType.toLowerCase()}`);
    }
    
    messageDiv.textContent = message;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  async function callVerifactAPI(text) {
    const API_ENDPOINT = 'https://verifact-backend.onrender.com/api/verify';
    const formData = new FormData();
    formData.append('text', text);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Verification failed');
    }

    return await response.json();
  }

  function formatAIResponse(data) {
    // Determine verdict type
    let verdictType = 'Inconclusive';
    if (data.verdict === 'True') verdictType = 'Verified';
    if (data.verdict === 'False') verdictType = 'Debunked';

    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai-message', `verdict-${verdictType.toLowerCase()}`);

    // Add verdict badge
    const verdictBadge = document.createElement('div');
    verdictBadge.classList.add('verdict-badge', verdictType.toLowerCase());
    verdictBadge.textContent = verdictType;
    messageDiv.appendChild(verdictBadge);

    // Add summary
    const summary = document.createElement('p');
    summary.textContent = data.summary;
    messageDiv.appendChild(summary);

    // Add detailed analysis
    const analysis = document.createElement('p');
    analysis.textContent = data.detailedAnalysis;
    messageDiv.appendChild(analysis);

    // Add sources if available
    if (data.sourcesUsed && data.sourcesUsed.length > 0) {
      const sourcesHeader = document.createElement('p');
      sourcesHeader.textContent = 'Sources:';
      sourcesHeader.style.marginTop = '15px';
      sourcesHeader.style.fontWeight = 'bold';
      messageDiv.appendChild(sourcesHeader);

      const sourcesList = document.createElement('div');
      sourcesList.classList.add('sources');

      data.sourcesUsed.forEach(source => {
        const sourceItem = document.createElement('div');
        sourceItem.classList.add('source-item');

        const link = document.createElement('a');
        link.href = source.url;
        link.classList.add('source-url');
        link.textContent = source.url;
        link.target = '_blank';

        const relevance = document.createElement('span');
        relevance.classList.add('relevance-tag');
        relevance.textContent = source.relevance;

        sourceItem.appendChild(link);
        sourceItem.appendChild(relevance);
        sourcesList.appendChild(sourceItem);
      });

      messageDiv.appendChild(sourcesList);
    }

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
});