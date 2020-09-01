import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const factoryInstance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0xd826C83eBb5BB98E8103E08A12eEC04654D1Fe13'
);

export default factoryInstance;
