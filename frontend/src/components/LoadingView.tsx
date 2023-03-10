import CircularProgress from '@mui/joy/CircularProgress'

function LoadingView() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      data-testid="loading-view"
    >
      <CircularProgress />
    </div>
  )
}

export default LoadingView
