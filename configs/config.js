module.exports = {
    env: process.env.C_ENV || 'development',
    development: {
        PORT: 3001,
        mongodb: {
            host: 'localhost',
            port: 27017,
            db: 'CROPPER',
            connection_options: {
                poolSize: 10
            }
        },
        session_secret: "!!CROPPER$$!!",
        api_record_limit: 20,
        base_url: "http://localhost:3001/",
        s3: {
            accessKeyId: "ID",
            secretAccessKey: "Key",
            bucket: "Rev"
        },
        s3_inspiration: {
            accessKeyId: "Id",
            secretAccessKey: "Key",
            bucket: "Insp"
        },
        upload_path: __dirname + '/../uploads',
    }
};
