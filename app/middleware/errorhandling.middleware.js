
module.exports = async function (err, req, res, next) {
    let error = err.message+err.stack;    
    console.log('central error', error)
    res.status(400).send('Errors Occurred on Server!');
}