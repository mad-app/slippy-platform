import request from 'request';

const URL = "http://smartm2m.co.kr"; //target

function main() {
    const postData = {
        'hello': 'world'
    };

    const postOption ={
        url: URL,
        json: postData
    };
    request.get(postOption, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log('test success');
            process.exit(0);
        } else {
            console.log("can't connect");
            // console.log(err);
            process.exit(1);
        }
    });
}

main();