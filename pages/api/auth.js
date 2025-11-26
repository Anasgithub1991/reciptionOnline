// import * as jose from 'jose'
const jose = require('jose')

//verify message ------------------------------------
const verifyMsg = (Verify, Msg, Token) => {
    const message = {
        verify: Verify,
        msg: Msg,
        token: Token
    }
    return message
}

const getToken = async sub => {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_SITE_KEY)
    const alg = 'HS256'

    const token = await new jose.SignJWT({ sub: sub })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('ITC')
        .setAudience('ITC')
        .setExpirationTime('5m')
        .sign(secret)      
    return token;
}

// verify JWEToken
const verifyToken = async (token) => {

    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_SITE_KEY)
    var verifiedToken
    try {
        verifiedToken = await jose.jwtVerify(token, secret, {
            issuer: 'ITC',
            audience: 'ITC',
        })
    } catch (error) {
        console.log("errorDecodeJWE", error);
        return verifyMsg(false, "Invalid token")
    }
    return verifyMsg(true, verifiedToken.payload.sub, token)
}

module.exports = { verifyMsg, verifyToken, getToken }