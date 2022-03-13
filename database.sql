create TABLE person(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255)
);

create TABLE post(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES person (id)
);

create TABLE file(
    id SERIAL PRIMARY KEY,
    path VARCHAR(255),
    post_id INTEGER,
    FOREIGN KEY (post_id) REFERENCES post (id)
);
