const environment=require('../environment/environment.json');

module.exports.settings=function(){
    const env =process.env.current_environment || 'development';
    return environment[env];
}