document.getElementById('verifyBtn').addEventListener('click', () => {
    const input = document.getElementById('claimInput').value;
    fetch(`https://your-api.com/verify?query=${encodeURIComponent(input)}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('result').textContent = data.result;
      })
      .catch(err => {
        document.getElementById('result').textContent = "Error verifying claim.";
      });
  });
  