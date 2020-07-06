const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async function (req, res, next) {
  try {
    //get token from header
    const token = req.header('x-auth-token');
    const decoded = jwt.verify(token, config.get('jwtSecret')) 
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token })

    if(!user){
        throw new Error()
    }

    req.token = token
    req.user = user
    next()
} catch (err) {
    res.status(401).send({error: 'Please authenticate.'})
}


  // //check if not token
  // if (!token) {
  //   return res.status(401).json({ msg: 'Please authenticate.' });
  // }

  // //verify token
  // try {
  //   const decoded = jwt.verify(token, config.get('jwtSecret'));

  //   req.user = decoded.user;
  //   next();
  // } catch (error) {
  //   res.status(401).json({ msg: 'Please authenticate.' });
  // }
};
