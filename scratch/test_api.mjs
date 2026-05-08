
import axios from 'axios';

async function testApi() {
  try {
    const res = await axios.get('http://localhost:3000/api/search-stocks?q=SpiceJet');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

testApi();
