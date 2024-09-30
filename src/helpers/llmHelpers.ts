import axios from 'axios';

export const fetchLLMModels = async () => {
  const response = await axios.get('/llm-models/');
  return response.data;
};
