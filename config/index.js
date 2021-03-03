function getPublicPath() {
    console.log(process.env);
    const publicPath = process.env.NODE_ENV === 'development' ? '/' : './';
    if (process.env.NODE_ENV === 'development') {
        console.log('开发环境');
    } else {
        console.log('生产环境');
    }
    return publicPath;
}

module.exports = getPublicPath;
