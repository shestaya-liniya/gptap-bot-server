import jwt from 'jsonwebtoken'
import config from '../../bot/db/auth.config.js'
import { db } from './../../bot/db/index.js'

const User = db.user

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    })
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: 'Unauthorized!'
        })
      }
      req.userId = decoded.id
      next()
    })
}

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'admin') {
          next()
          return
        }
      }

      res.status(403).send({
        message: 'Require Admin Role!'
      })
      return
    })
  })
}

const isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'moderator') {
          next()
          return
        }
      }

      res.status(403).send({
        message: 'Require Moderator Role!'
      })
    })
  })
}

const isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'moderator') {
          next()
          return
        }

        if (roles[i].name === 'admin') {
          next()
          return
        }
      }

      res.status(403).send({
        message: 'Require Moderator or Admin Role!'
      })
    })
  })
}

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin
}
export default authJwt
