import server from '.'

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
