import Graph from '../components/graph';
import { useRouter } from 'next/router'
import { Layout, Typography, Row, Col } from 'antd';
import { clients } from '../utils/mock';

const { Title } = Typography;
const { Content, Header } = Layout;

export default function Home() {
  const router = useRouter()
  const { sim = '0',  interval = '2' } = router.query
  const defaultInterval = isNaN(interval) ? 2 : +interval

  return (
    <Layout>
      <Header style={{ textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', marginTop: '6px' }}>
          Monitoring Dashboard Simulation
        </Title>
      </Header>
      <Content style={{ padding: '50px 50px' }}>
        <Row>
          {clients.map((client) => {
            return (
              <Col key={client.circuitId} style={{ margin: '5px 5px' }}>
                <Graph client={client} isShowSimBtn={sim === '1'} interval={defaultInterval}></Graph>
              </Col>
            );
          })}
        </Row>
      </Content>
    </Layout>
  );
}
