--VIZUALIZARE

--toti muzicienii nascuti dupa 1990

SELECT m.*
FROM musicians m
JOIN musician_details md ON m.musician_id = md.musician_id
WHERE md.birth_date > TO_DATE('1990-01-01', 'YYYY-MM-DD');

--toate concertele care au in repertoriu piesa 'The Firebird' 

SELECT c.*
FROM concerts c
JOIN repertory r ON c.concert_id = r.concerts_concert_id
JOIN musical_pieces mp ON r.musical_pieces_code = mp.code
WHERE mp.title = 'The Firebird';

--toti muzicienii experti(peste 10 ani de experienta) care nu au niciun instrument asignat

SELECT m.*
FROM musicians m
LEFT JOIN assignations a ON m.musician_id = a.musician_id
WHERE m.year_of_studies > 10 AND a.assignation_id IS NULL;

--concerte top cu muzicieni cu peste 10 ani experienta 

SELECT c.concert_id, c.location, c.concert_date
FROM concerts c
JOIN concert_requirments cr ON c.concert_id = cr.concert_id
JOIN musicians m ON cr.musician_id = m.musician_id
WHERE m.year_of_studies >= 10;

--asignarile muzicianului Nathan Daniel
SELECT *
FROM assignations
WHERE musician_id = (SELECT musician_id FROM musicians WHERE name = 'Nathan Daniel');

-- de cate ori a fost asignat fiecare tip de instrument 

SELECT i.type, COUNT(a.instrument_id) AS numar_asignari
FROM assignations a
JOIN inventory i ON a.instrument_id = i.instrument_id
GROUP BY i.type
ORDER BY numar_asignari DESC;


 
---------------------------------------------------------------------------------

--adaugare-insert uri care nu ar trebui sa mearga

--contact email

INSERT INTO musician_details (contact_email, birth_date, musician_id)
VALUES ('invalid_email', TO_DATE('1990-01-01', 'YYYY-MM-DD'), 4);


-- year_of_studies > 5
INSERT INTO musicians (musician_id, name, year_of_studies, type)
VALUES (musician_id_seq.nextval, 'Alex Johnson', 3, 'Violin');

--unique constraint
INSERT INTO musical_pieces (code, title, author)
VALUES (musical_piece_code_seq.nextval, 'The Planets', 'Gustav Holst');

INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES ((SELECT concert_id FROM concerts WHERE location = 'City Council Hall'), 'Violin',
        (SELECT musician_id FROM musicians WHERE name = 'Claire Debussy'));
        
--location+date-> unique combination for concerts table

INSERT INTO concerts (concert_id, location, concert_date)
VALUES (2, 'Concert Hall', TO_DATE('2024-01-01', 'YYYY-MM-DD'));

-- Attempt to insert a duplicate record
INSERT INTO concerts (concert_id, location, concert_date)
VALUES (3, 'Concert Hall', TO_DATE('2024-01-01', 'YYYY-MM-DD'));


--foreign key constraint 
INSERT INTO concert_requirments (concert_id, type, musician_id)
VALUES (999, 'Violin', (SELECT musician_id FROM musicians WHERE name = 'Claire Debussy'));


--date constraint for assignation_date

INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
VALUES (
  assignation_id_seq.nextval,
  TO_DATE('2023-02-21', 'YYYY-MM-DD'),
  TO_DATE('2023-12-20', 'YYYY-MM-DD'),
  (SELECT musician_id FROM musicians WHERE name = 'Nathan Daniel'),
  (SELECT min(instrument_id) FROM inventory WHERE type = 'Flute')
);


------------------------------------------------------------------------------------------------

--UPDATE

--amanam un concert de la o anumita locatie cu o saptamana

UPDATE concerts
SET concert_date = concert_date + 7
WHERE location = 'Concert Hall';


--prelungim perioada de asignare pentru muzicianul Claire Debussy

UPDATE assignations
SET end_date = end_date + 7
WHERE musician_id = (select musician_id
                    from musicians
                    where name='Claire Debussy');

--uzarea exemplarelor de instrumente

UPDATE inventory
SET conservation_state = 'Good'
WHERE conservation_state = 'New';




--verificam la un insert daca nr de exemplare dintr-un tip de instrument este mai mare sau egal cu nr de exemplare disponibile

DECLARE
    v_instrument_type VARCHAR2(20) := 'Violin';
    v_units_available NUMBER;
    v_units_allocated NUMBER;

BEGIN
    SELECT units_available, units_allocated
    INTO v_units_available, v_units_allocated
    FROM instruments
    WHERE type = v_instrument_type
    FOR UPDATE;
    
    v_units_allocated := v_units_allocated + 1;

    IF v_units_allocated > v_units_available THEN
        DBMS_OUTPUT.PUT_LINE('Error: Units allocated exceed units available. Rolling back transaction.');
        ROLLBACK;
    ELSE
        UPDATE instruments
        SET units_allocated = v_units_allocated
        WHERE type = v_instrument_type;

        DBMS_OUTPUT.PUT_LINE('Instrument inserted successfully.');
        COMMIT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('An error occurred: ' || SQLERRM);
        ROLLBACK;
END;
/



--verificam daca instrumentul pe care vrem sa il asignam este disponibil 


DECLARE
    v_last_end_date DATE;
    v_start_date DATE := TO_DATE('2024-02-15', 'YYYY-MM-DD');
    v_end_date DATE := TO_DATE('2024-02-20', 'YYYY-MM-DD');
    v_musician_name VARCHAR2(30) := 'Nathan Daniel';
    v_instrument_type VARCHAR2(20) := 'Flute';
    v_musician_id NUMBER;
    v_instrument_id NUMBER;
BEGIN
    savepoint first;
    SELECT musician_id INTO v_musician_id
    FROM musicians
    WHERE name = v_musician_name;
    SELECT MIN(instrument_id) INTO v_instrument_id
    FROM inventory
    WHERE type = v_instrument_type;
    SELECT MAX(end_date)
    INTO v_last_end_date
    FROM assignations
    WHERE instrument_id = v_instrument_id;
    IF v_last_end_date IS NOT NULL AND v_last_end_date >= v_start_date THEN
        ROLLBACK to first;
    ELSE
        SAVEPOINT start_transaction;
        INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
        VALUES (
            assignation_id_seq.nextval,
            v_start_date,
            v_end_date,
            v_musician_id,
            v_instrument_id
        );
    END IF;
        COMMIT;
        
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK to start_transaction;
END;
/


SET SERVEROUTPUT ON;
--------------------------------------------------------------------------------------

--DELETE

--anulam primul concert intrucat orchestra nu este inca pregatita

DECLARE
  v_concert_id NUMBER;

BEGIN
  SELECT concert_id
  INTO v_concert_id
  FROM concerts
  WHERE concert_date = (SELECT MIN(concert_date) 
                       FROM concerts
                       WHERE location = 'City Park');

  DELETE FROM concert_requirments WHERE concert_id = v_concert_id;
  DELETE FROM repertory WHERE concerts_concert_id = v_concert_id;
  DELETE FROM concerts WHERE concert_id = v_concert_id;

  COMMIT;
END;
/

--stergem din inventar toate instrumentele de nefolosit                   

DELETE FROM inventory
WHERE conservation_state = 'Not_Usable';
