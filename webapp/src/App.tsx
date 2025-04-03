import { TrpcProvider } from './lib/trpc'
import { HomePage } from './pages/HomePage'

// export const App = () => {
//   return <Layout />;
// };
export const App = () => {
  return (
    <TrpcProvider>
      <HomePage />
    </TrpcProvider>
  )
}