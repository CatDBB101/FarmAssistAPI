function matchAccount(account_database, username, password) {
    var res = {
        key: undefined,
        username: undefined,
        status: {
            username: false,
            password: false,
        },
    };
    account_database.forEach((account) => {
        if (account[0] == username) {
            password_correct = account[1] == password;

            res.status.username = true;
            res.status.password = password_correct;

            if (password_correct) {
                res.key = account[2];
                res.username = account[0];
            }
            return;
        }
        console.log(account, username, password);
    });
    return res;
}

function generateKey() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function confirmCreate(account_database, username, key) {
    var res = {
        key: key,
        username: username,
        status: {
            username: true,
        },
    };
    account_database.forEach((account) => {
        if (account[0] == username) {
            res.status.username = false;
            res.key = undefined;
            res.username = undefined;
            return;
        }
    });
    return res;
}

function confirmCreateNode(node_list, node_name, key) {
    var res = {
        status: {
            node_name: true,
        },
    };

    node_list.forEach((node_info) => {
        if (node_info[0] == key) {
            if (node_info[1] == node_name) {
                res.status.node_name = false;
                return;
            }
        }
    });
    return res;
}

function nodeList(nodes_name, key) {
    var res = {
        node_list: [],
        status: {
            key: true,
        },
    };
    nodes_name.forEach((node_info) => {
        if (node_info[0] == key) {
            res.node_list.push(node_info[1]);
        }
    });
    if (res.node_list.length === 0) {
        res.status.key = false;
    }
    return res;
}

function confirmNode(nodes_name, node_name, key) {
    var res = {
        status: {
            found: false,
        },
    };
    nodes_name.forEach((node_info) => {
        console.log(node_info);
        if (node_info[0] == key && node_info[1] == node_name) {
            res.status.found = true;
        }
    });

    return res;
}

module.exports = {
    matchAccount,
    confirmCreate,
    generateKey,
    confirmCreateNode,
    nodeList,
    confirmNode,
};
