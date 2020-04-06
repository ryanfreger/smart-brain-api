const jwt = require('jsonwebtoken');
const redisClient = require('./signin').redisClient

const signToken = (email) => {
  const JWTPayload = { email };
  return jwt.sign(JWTPayload, 'JWT_SECRET');
}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
}

const createSession = (user) => {
  //Create JWT, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
  .then(() => { return {success: 'true', id: id, token: token} })
  .catch(console.log('dffsf'))
}

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            // console.log(user)
            return user ? createSession(user[0]) : Promise.reject(user[0])            
            // res.json(user[0]);
          })
          .then(session => res.json(session))
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    // .then(data => {return user.id && user.email ? createSession(user) : Promise.reject(user)})
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
  handleRegister: handleRegister
};


