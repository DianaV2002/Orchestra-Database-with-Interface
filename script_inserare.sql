-- Inserts for instruments table
INSERT INTO instruments (type, units_available, units_allocated, category)
VALUES ('Trumpet', 3, 0, 'Brass');

INSERT INTO instruments (type, units_available, units_allocated, category)
VALUES ('Violin', 4, 0, 'Strings');

INSERT INTO instruments (type, units_available, units_allocated, category)
VALUES ('Flute', 3, 0, 'Woodwinds');

INSERT INTO instruments (type, units_available, units_allocated, category)
VALUES ('Cello', 2, 0, 'Strings');

INSERT INTO instruments (type, units_available, units_allocated, category)
VALUES ('Piano', 2, 0, 'Percussion');

-- Inserts for inventory table
INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (null, 'Good', 'Trumpet');

INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (inventory_instr_id_seq.nextval, 'New', 'Violin');

INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (inventory_instr_id_seq.nextval, 'Good', 'Flute');

INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (inventory_instr_id_seq.nextval, 'Not_Usable', 'Flute');

INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (inventory_instr_id_seq.nextval, 'Good', 'Flute');

INSERT INTO inventory (instrument_id, conservation_state, type)
VALUES (inventory_instr_id_seq.nextval, 'New', 'Piano');

-- Inserts for musical_pieces table
INSERT INTO musical_pieces (code, title, author)
VALUES (null, 'Boléro', 'Maurice Ravel');

INSERT INTO musical_pieces (code, title, author)
VALUES (musical_piece_code_seq.nextval, 'The Planets', 'Gustav Holst');

INSERT INTO musical_pieces (code, title, author)
VALUES (musical_piece_code_seq.nextval, 'The Firebird', 'Igor Stravinsky');

INSERT INTO musical_pieces (code, title, author)
VALUES (musical_piece_code_seq.nextval, 'Swan Lake', 'Pyotr Ilyich Tchaikovsky');

INSERT INTO musical_pieces (code, title, author)
VALUES (musical_piece_code_seq.nextval, 'Clair de Lune', 'Claude Debussy ');

-- Inserts for musicians table
INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (null, 'John Newman', 5, 'Trumpet');

INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musical_piece_code_seq.nextval, 'Claire Debussy', 6, 'Violin');

INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musical_piece_code_seq.nextval, 'Nathan Daniel', 7, 'Flute');

INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musical_piece_code_seq.nextval, 'Michael Frost', 12, 'Violin');

INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musical_piece_code_seq.nextval, 'George Michael', 15, 'Trumpet');

INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musical_piece_code_seq.nextval, 'Nathan Gole', 8, 'Piano');


-- Inserts for musician_details table
INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('j.newman23@gmail.com', TO_DATE('1990-01-01', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'John Newman'));

INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('clDEB2000@gmail.com', TO_DATE('1991-02-01', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'Claire Debussy'));

INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('nath.daniel@gmail.com', TO_DATE('1992-03-01', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'Nathan Daniel'));
    
INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('frosty@gmail.com', TO_DATE('1991-11-01', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'Michael Frost'));
    
INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('lastChristmas@gmail.com', TO_DATE('1989-12-07', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'George Michael'));

INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('nathGoll48@gmail.com', TO_DATE('1992-12-17', 'YYYY-MM-DD'), 
    (SELECT musician_id FROM musicians WHERE name = 'Nathan Gole'));
    
    
--inserts into requirment table

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'The Planets'), 'Flute', 1);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'The Planets'), 'Violin', 2);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'The Planets'), 'Trumpet', 1);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'Boléro'), 'Violin', 2);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'Boléro'), 'Flute', 2);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'The Firebird'), 'Flute', 2);

insert into requirment(musical_pieces_code, instruments_type, units_needed)
values((select code from musical_pieces where title = 'The Firebird'), 'Trumpet', 2);

-- Inserts for concerts table
INSERT INTO concerts (concert_id, location, concert_date)
VALUES (null, 'Concert Hall', TO_DATE('2024-04-01', 'YYYY-MM-DD'));

INSERT INTO concerts (concert_id, location, concert_date)
VALUES (concert_id_seq.nextval, 'City Council Hall', TO_DATE('2024-05-01', 'YYYY-MM-DD'));

INSERT INTO concerts (concert_id, location, concert_date)
VALUES (concert_id_seq.nextval, 'City University', TO_DATE('2024-06-01', 'YYYY-MM-DD'));

INSERT INTO concerts (concert_id, location, concert_date)
VALUES (concert_id_seq.nextval, 'City Park', TO_DATE('2023-12-31', 'YYYY-MM-DD'));


INSERT INTO concerts (concert_id, location, concert_date)
VALUES (concert_id_seq.nextval, 'City Mall', TO_DATE('2024-07-15', 'YYYY-MM-DD'));



-- Inserts for concert_requirements table
INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'Concert Hall'), 'Trumpet', 
    (SELECT musician_id FROM musicians WHERE name = 'John Newman'));

INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'City Council Hall'), 'Violin', 
    (SELECT musician_id FROM musicians WHERE name = 'Claire Debussy'));
    
INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'City Council Hall'), 'Piano', 
    (SELECT musician_id FROM musicians WHERE name = 'Nathan Gole'));

INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'City University'), 'Flute', 
    (SELECT musician_id FROM musicians WHERE name = 'Nathan Daniel'));

INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'City University'), 'Violin', 
    (SELECT musician_id FROM musicians WHERE name = 'Michael Frost'));
    
-- Inserts for repertory table
INSERT INTO repertory (musical_pieces_code, concerts_concert_id)
VALUES ((SELECT code FROM musical_pieces WHERE title = 'The Planets'), 
    (SELECT concert_id FROM concerts WHERE location = 'Concert Hall'));

INSERT INTO repertory (musical_pieces_code, concerts_concert_id)
VALUES ((SELECT code FROM musical_pieces WHERE title = 'The Firebird'), 
    (SELECT concert_id FROM concerts WHERE location = 'City Council Hall'));

INSERT INTO repertory (musical_pieces_code, concerts_concert_id)
VALUES ((SELECT code FROM musical_pieces WHERE title = 'Boléro'), 
    (SELECT concert_id FROM concerts WHERE location = 'City University'));
    
INSERT INTO repertory (musical_pieces_code, concerts_concert_id)
VALUES ((SELECT code FROM musical_pieces WHERE title = 'Swan Lake'), 
    (SELECT concert_id FROM concerts WHERE location = 'City Mall'));

INSERT INTO repertory (musical_pieces_code, concerts_concert_id)
VALUES ((SELECT code FROM musical_pieces WHERE title = 'Clair de Lune'), 
    (SELECT concert_id FROM concerts WHERE location = 'City Mall'));


--assginations
INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  null,
  TO_DATE('2023-12-30', 'YYYY-MM-DD'),
  TO_DATE('2024-02-10', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'John Newman'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Trumpet')
);

INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  assignation_id_seq.nextval,
  TO_DATE('2024-03-02', 'YYYY-MM-DD'),
  TO_DATE('2024-03-13', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'Claire Debussy'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Violin')
);

INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  assignation_id_seq.nextval,
  TO_DATE('2024-12-21', 'YYYY-MM-DD'),
  TO_DATE('2024-12-22', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'Nathan Daniel'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Flute')
);

INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  assignation_id_seq.nextval,
  TO_DATE('2024-01-20', 'YYYY-MM-DD'),
  TO_DATE('2024-02-01', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'Nathan Gole'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Piano')
);

INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  assignation_id_seq.nextval,
  TO_DATE('2024-02-02', 'YYYY-MM-DD'),
  TO_DATE('2024-04-01', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'George Michael'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Trumpet')
);

