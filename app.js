const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
const port = 3000;

// Setez folderul de unde se vor lua fisierele statice html si css
app.use(express.static(path.join(__dirname, 'views')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// OracleDB connection pool configuration
const dbConfig = {
    user: 'bd116',
    password: 'bd116',
    connectString: 'bd-dc.cs.tuiasi.ro:1539/orcl',
    poolMax: 10,
    poolMin: 2,
    poolIncrement: 2,
    poolTimeout: 60
};

// Create OracleDB connection pool
let pool;

// Se creeaza un pool de conexiuni la baza de date ce vor fi refolosite de fiecare data cand se va face o conexiune la baza de date pentru a eficientiza conexiunea
async function init() {
    pool = await oracledb.createPool(dbConfig);
}

init();

// Define routes for CRUD operations
app.get('/', (req, res) => {
    res.render('index');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/concerts', async (req, res) => {
    try {
        connection = await oracledb.getConnection();
        query = 'SELECT * FROM concerts order by concert_date';
        result = await connection.execute(query);
        concerts = result.rows.map(concert => {
            return [concert[0], concert[1], formatDateTime(concert[2])]
        });
        
        res.render('concerts', { concerts });
    } catch (error) {
        console.error('Error fetching concerts:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        connection.close();
    }
  });

app.get('/concerts/:id', async (req, res) => {
    try {
        connection = await oracledb.getConnection();
        const concertId = req.params.id;
        /*const concert_info_query = `SELECT concert_date, location 
                    FROM concerts 
                    WHERE concert_id = :concertId`;
        const result_concert = await connection.execute(concert_info_query, { concertId });
        const concert_details = result_concert.rows[0];
        const [date, location] = concert_details
        */
        const query = `
        SELECT musical_pieces.code,musical_pieces.Title, musical_pieces.Author
        FROM concerts
        JOIN repertory ON concerts.concert_id = repertory.concerts_concert_id
        JOIN musical_pieces ON repertory.musical_pieces_code = musical_pieces.code
        WHERE concerts.concert_id = :concertId

      `;
  
      const result = await connection.execute(query, { concertId });
      const details = result.rows;
      res.render('repertory', { details, concertId });
    } catch (error) {
        console.error('Error fetching concert:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        connection.close(); // Close the connection in the 'finally' block
    }
  });

  app.get('/concerts/:concert_id/pieces/:piece_id', async (req, res) => {
    try {
        connection = await oracledb.getConnection();
        const concertId=req.params.concert_id;
        const pieceId=req.params.piece_id;

        query = `SELECT requirment.instruments_type, requirment.units_needed
                FROM requirment 
                WHERE requirment.musical_pieces_code = :piece_id`;
      const result = await connection.execute(query, { piece_id: pieceId });
      const instruments = result.rows;
      res.render('requirment', { instruments, concertId, pieceId});
    } catch (error) {
        console.error('Error fetching pieces:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        connection.close(); // Close the connection in the 'finally' block
    }
  });

  app.get('/concerts/:concert_id/pieces/:piece_id/instruments/:instrType', async (req, res) => {
    try {
        connection = await oracledb.getConnection();
        const concertId=req.params.concert_id;
        const pieceId=req.params.piece_id;
        const instrType=req.params.instrType;

        query = `SELECT DISTINCT musicians.name, musicians.Year_Of_Studies, musician_details.Contact_Email
                FROM musicians 
                JOIN concert_requirments on musicians.musician_id=concert_requirments.musician_id
                JOIN musician_details on musicians.Musician_ID=musician_details.Musician_ID
                JOIN concerts on concert_requirments.concert_id = concerts.concert_id
                JOIN repertory on concerts.concert_id = repertory.concerts_concert_id
                JOIN musical_pieces on musical_pieces.code = repertory.musical_pieces_code
                JOIN requirment on musical_pieces.code = requirment.musical_pieces_code

                WHERE concert_requirments.type = :instrType 
                    AND concerts.concert_id = :concertId
                    AND musical_pieces.code = :pieceId
                `;
        
      const result = await connection.execute(query, { instrType, concertId, pieceId});
      const musicians = result.rows;
      if (musicians && musicians.length > 0) {
        res.render('musicians_req', { musicians, concertId, pieceId, instrType});
      }
      else
      {
        res.render('musicians_req', { musicians: [], concertId, pieceId, instrType });
      }
  

    } catch (error) {
        console.error('Error fetching instruments:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        connection.close(); // Close the connection in the 'finally' block
    }
  });

 
  app.get('/concerts/:concertId/pieces/:pieceId/instruments/:instrType/addMusician', async (req, res) => {
    try {
      const concertId = req.params.concertId;
      const pieceId = req.params.pieceId;
      const instrType = req.params.instrType;
  
      const connection = await oracledb.getConnection();
      const query = `SELECT name FROM musicians WHERE type = :instrType`;
      const result = await connection.execute(query, { instrType });
      const musicians = result.rows;
  
      await connection.close();
  
      res.render('addMusician', {
        concertId,
        pieceId,
        instrType,
        musicians,
        errorMessage: null,
      });
    } catch (error) {
      console.error('Error handling addMusician request:', error);
      res.render('addMusician', { concertId, pieceId, instrType, musicians: [], errorMessage: error });
      //res.status(500).send('Internal Server Error');
    }
  });
  
  app.post('/submitMusician', async (req, res) => {
    const selectedMusician = req.body.selectedMusician;
    const concertId = req.body.concertId;
    const instrType = req.body.instrType;
    const pieceId = req.body.pieceId;
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `INSERT INTO concert_requirments (concert_id, type, musician_id) 
         VALUES (:concertId, :instrType, (SELECT musician_id FROM musicians WHERE name = :selectedMusician))`,
        {
          concertId,
          instrType,
          selectedMusician,
        },
        { autoCommit: true }
      );
      await connection.close();
  
      res.redirect(`/concerts/${concertId}/pieces/${pieceId}/instruments/${instrType}`);
    } catch (error) {
      if (error && error.code === 'ORA-00001') {
        res.render('addMusician', {
          concertId,
          instrType,
          musicians: [],
          errorMessage: error,
        });
      } else {
        console.error('Error submitting musician:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  });
  

app.get('/musicians', async (req, res) => {
  try {
      connection = await oracledb.getConnection();
      query = `SELECT musicians.name, instruments.type, musicians.year_of_studies, musician_details.contact_email, musician_details.birth_date
              FROM musicians join instruments on musicians.type=instruments.type
              join musician_details on musicians.musician_id=musician_details.musician_id
              order by musicians.name`;
      result = await connection.execute(query);
      musicians = result.rows.map(musician => {
        return [musician[0], musician[1],musician[2],musician[3], formatDateTime(musician[4])]
    });
      res.render('musicians', { musicians });
  } catch (error) {
      console.error('Error fetching musicians:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      connection.close(); // Close the connection in the 'finally' block
  }
});

app.get('/Musical_pieces', async (req, res) => {
  try {
      connection = await oracledb.getConnection();
      query = `SELECT musical_pieces.code,musical_pieces.title, musical_pieces.author
      from musical_pieces`;
      result = await connection.execute(query);
      const musical_pieces = result.rows;
      res.render('musical_pieces', { musical_pieces });
  } catch (error) {
      console.error('Error fetching musical_pieces:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      connection.close(); // Close the connection in the 'finally' block
  }
});

app.get('/Musical_Pieces/:pieceId/InstrumentsReqPiece', async (req, res) => {
  try {
    connection = await oracledb.getConnection();
    const pieceId = req.params.pieceId; // Fix the parameter name here
    query = `SELECT requirment.instruments_type, requirment.units_needed
      FROM requirment
      JOIN musical_pieces ON requirment.musical_pieces_code = musical_pieces.code
      WHERE musical_pieces.code = :pieceId`; // Adjust the query to filter by pieceId
    result = await connection.execute(query, [pieceId]);
    const instrumentsReq = result.rows;
    res.render('instrumentsReqPiece', { instrumentsReq });
  } catch (error) {
    console.error('Error fetching instrumentsReq:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    connection.close();
  }
});

app.get('/inventory', async (req, res) => {
  try {
      connection = await oracledb.getConnection();
      query = `select inventory.instrument_id, inventory.type, inventory.conservation_state, instruments.category, instruments.units_available, instruments.units_allocated
      from inventory join instruments on inventory.type=instruments.type
      order by inventory.instrument_id`;
      result = await connection.execute(query);
      const inventory = result.rows;
      res.render('inventory', { inventory });
  } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      connection.close(); 
  }
});
app.get('/assignations', async (req, res) => {
  try {
      connection = await oracledb.getConnection();
      query = `select assignations.assignation_id, musicians.name, inventory.type, assignations.start_date, assignations.end_date-assignations.start_date as "Days assigned"
      from assignations join musicians on assignations.musician_id=musicians.musician_id
      join inventory on assignations.instrument_id=inventory.instrument_id
      order by assignation_id`;
      result = await connection.execute(query);
      assignations = result.rows.map(assignation => {
        return [assignation[0], assignation[1], assignation[2],formatDateTime(assignation[3]), assignation[4]]
    });
      res.render('assignations', { assignations });
  } catch (error) {
      console.error('Error fetching assignations:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      connection.close();
  }
});


app.get('/addConcert', (req, res) => {
  res.render('addConcert', { successMessage: null });
});

app.post('/submitConcert', async (req, res) => {
  try {
    const location = req.body.location;
    const concertDate = req.body.concertDate;
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO concerts (concert_id, location, concert_date) VALUES (CONCERT_ID_SEQ.nextval, :location, TO_DATE(:concertDate, 'YYYY-MM-DD'))`,
      { location, concertDate }
    );
    await connection.commit();
    await connection.close();
    res.render('addConcert', { successMessage: 'Concert added successfully!' });
  } catch (error) {
    console.error('Error submitting concert:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/updateConcert/:concertId', async (req, res) => {
  try {
    const concertId = req.params.concertId;
    res.render('updateConcert', { concertId, successMessage: null, errorMessage: null });
  } catch (error) {
    console.error('Error fetching concert information for delay:', error);
  }
});

app.post('/submitDelayConcert/:concertId', async (req, res) => {
  const concertId = req.params.concertId;
  const newDate = req.body.newConcertDate;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE concerts SET concert_date = TO_DATE(:newDate, 'YYYY-MM-DD') WHERE concert_id = :concertId`,
      { newDate, concertId }
    );
    await connection.commit();
    await connection.close();
    res.render('updateConcert', { concertId, successMessage: 'Concert delayed successfully!', errorMessage: null });
  } catch (error) {
    console.error('Error delaying concert:', error);
    res.render('updateConcert', {concertId ,errorMessage: 'The selected date should be greater than today.', successMessage: null });
  }
});


app.get('/cancelConcert/:concertId', async (req, res) => {
  try {
    const concertId = req.params.concertId;
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      'DELETE FROM concert_requirments WHERE concert_id = :concertId',
      [concertId]
    );
    await connection.execute(
      'DELETE FROM repertory WHERE concerts_concert_id = :concertId',
      [concertId]
    );
    await connection.execute(
      'DELETE FROM concerts WHERE concert_id = :concertId',
      [concertId]
    );
    await connection.commit();
    await connection.close();
    res.render('cancelConcert');
  } catch (error) {
    console.error('Error canceling concert:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/addToRepertory/:concertId', async (req, res) => {
  try {
    const concertId = req.params.concertId;
    const connection = await oracledb.getConnection(dbConfig);
    const musicalPiecesResult = await connection.execute('SELECT * FROM musical_pieces');
    const musicalPieces = musicalPiecesResult.rows.map(piece => ({
      CODE: piece[0],
      TITLE: piece[1],
      AUTHOR: piece[2],
    }));

    await connection.close();

    res.render('addToRepertory', {
      concertId,
      musicalPieces,
      successMessage: null, 
      errorMessage: null, 
    });
  } catch (error) {
    console.error('Error handling addToRepertory request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitRepertory', async (req, res) => {
  const musicalPieceCode = req.body.musicalPieces;
  const concertId = req.body.concertId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO repertory (musical_pieces_code, concerts_concert_id) VALUES (:musicalPieceCode, :concertId)`,
      { musicalPieceCode, concertId }
    );

    await connection.commit();
    await connection.close();

    res.render('addToRepertory', {
      concertId,
      musicalPieces: [],
      successMessage: 'Piece added to repertory successfully!',
      errorMessage:null,
    });
  } catch (error) {
    if (error && error.code === 'ORA-00001') {
      res.render('addToRepertory', {
        concertId,
        musicalPieces: [],
        errorMessage: 'Error: Unique constraint violation. This piece is already in the Repertory.',
        successMessage:null,
      });
    } else {
      console.error('Error submitting to repertory:', error);
      res.status(500).send('Internal Server Error');
    }
  }
});

app.delete('/deletePiece/:concertId/:pieceId', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const concertId = req.params.concertId;
    const pieceId = req.params.pieceId;

    await connection.execute(
      `DELETE FROM repertory WHERE musical_pieces_code = :pieceId AND concerts_concert_id = :concertId`,
      { pieceId, concertId }
    );
    await connection.commit();
    await connection.close();

    res.status(200).send('Piece deleted successfully');
  } catch (error) {
    console.error('Error deleting piece:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/addToInventory', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const instrumentTypesQuery = 'SELECT DISTINCT type FROM instruments';
    const instrumentTypesResult = await connection.execute(instrumentTypesQuery);
    const instrumentTypes = instrumentTypesResult.rows;
    res.render('addToInventory', { instrumentTypes, errorMessage: null , successMessage: null});
  } catch (error) {
    console.error('Error fetching instrument types:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitInventory', async (req, res) => {
  const type = req.body.type;
  const conservationState = req.body.conservationState;
  const connection = await oracledb.getConnection(dbConfig);
  try {
    const plsqlBlock = `
    DECLARE
      v_instrument_type VARCHAR2(20) := :type;
      v_conservation_state VARCHAR2(20) := :conservationState;
      v_units_available NUMBER;
      v_units_allocated NUMBER;
      v_instrument_id NUMBER;
      v_error_message VARCHAR2(500);  
      v_success_message VARCHAR2(500);
    BEGIN
      SELECT units_available, units_allocated
      INTO v_units_available, v_units_allocated
      FROM instruments
      WHERE type = v_instrument_type
      FOR UPDATE;
      v_units_allocated := v_units_allocated + 1;

      IF v_units_allocated > v_units_available THEN
        RAISE_APPLICATION_ERROR(-20001, 'Transaction failed: The number of units allocated exceeds the number of units available for this instrument');
      ELSE
        UPDATE instruments
        SET units_allocated = v_units_allocated
        WHERE type = v_instrument_type;
        INSERT INTO inventory (instrument_id, conservation_state, type)
        VALUES (inventory_instr_id_seq.nextval, 'Good', v_instrument_type)
        RETURNING instrument_id INTO v_instrument_id;
        COMMIT;
        v_success_message := 'Instrument added to inventory successfully.';
      END IF;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'No data found for the specified instrument type');
      WHEN OTHERS THEN
        v_error_message := 'Internal Server Error: ' || SQLERRM;
        RAISE_APPLICATION_ERROR(-20003, v_error_message);
    :successMessage := v_success_message;
    :errorMessage := v_error_message;
    END;
  `;

    const bindVars = {
      type,
      conservationState,
      errorMessage: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      successMessage: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    };    
    const result = await connection.execute(plsqlBlock, bindVars, { autoCommit: false });
    const errorMessage = result.outBinds.error_message;
    const successMessage = result.outBinds.success_message;
    res.render('addToInventory',{instrumentTypes: [], successMessage:successMessage, errorMessage:errorMessage});
  } catch (error) {
    console.error('Transaction failed:', error);
    res.render('addToInventory',{instrumentTypes: [], successMessage:null, errorMessage:error});
    await connection.rollback();
  } finally {
    await connection.close();
  }
});

app.get('/updateState/:instrumentId', async (req, res) => {
  try {
    const instrumentId=req.params.instrumentId;
    res.render('updateState', { instrumentId, successMessage: null, errorMessage: null });
  } catch (error) {
    console.error('Error fetching instrument list:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitUpdateConservation', async (req, res) => {
  const instrumentId = req.body.instrumentId;
  const newConservationState = req.body.newConservationState;
  const connection = await oracledb.getConnection(dbConfig);
  try {

    const result = await connection.execute(
      `UPDATE inventory SET conservation_state = :newConservationState WHERE instrument_id = :instrumentId`,
      { newConservationState, instrumentId }
    );
    await connection.commit();
    res.render('updateState', { instrumentId, successMessage: 'State altered successfully!', errorMessage: null });
  } catch (error) {
    console.error('Error changing state:', error);
    res.render('updateState', {instrumentId ,errorMessage: 'State could not be altered.', successMessage: null });
  } finally{
    await connection.close();
  }
});

app.get('/deleteFromInventory/:instrumentId', async (req, res) => {
  try {
    const instrumentId = req.params.instrumentId;
    res.render('deleteFromInventory', { instrumentId, errorMessage: null, successMessage: null });
  } catch (error) {
    console.error('Error rendering delete form:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitDeleteFromInventory/:instrumentId', async (req, res) => {
  const instrumentId = req.params.instrumentId;
  const connection = await oracledb.getConnection(dbConfig);
  try {
    const plsqlBlock = `
    DECLARE
  v_instrument_id NUMBER := :instrumentId;
  v_instrument_type VARCHAR2(20);
  v_units_allocated NUMBER;
  v_error_message VARCHAR2(500);
  v_success_message VARCHAR2(500);
BEGIN
  -- Fetch instrument type and units_allocated for the specified instrument id
  SELECT i.type, i.units_allocated
  INTO v_instrument_type, v_units_allocated
  FROM instruments i
  JOIN inventory inv ON i.type = inv.type
  WHERE inv.instrument_id = v_instrument_id
  FOR UPDATE;

  -- Check if units_allocated is already 0
  IF v_units_allocated = 0 THEN
    v_error_message := 'Cannot delete. Units_allocated is already 0.';
    RAISE_APPLICATION_ERROR(-20004, v_error_message);
  END IF;

  -- Decrement units_allocated
  v_units_allocated := v_units_allocated - 1;

  -- Update instruments table
  UPDATE instruments i
  SET i.units_allocated = v_units_allocated
  WHERE i.type = v_instrument_type;

  DELETE FROM inventory
  WHERE instrument_id = v_instrument_id;
  -- Commit the transaction
  COMMIT;
  v_success_message := 'Instrument deleted from inventory successfully.';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    -- Handle the case where no data is found
    RAISE_APPLICATION_ERROR(-20002, 'No data found for the specified instrument id');
  WHEN OTHERS THEN
    -- Handle other exceptions
    v_error_message := 'Internal Server Error: ' || SQLERRM;
    RAISE_APPLICATION_ERROR(-20003, v_error_message);
  :successMessage := v_success_message;
  :errorMessage := v_error_message;
END;
  `;

    const bindVars = {
      instrumentId,
      errorMessage: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      successMessage: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    };    
    const result = await connection.execute(plsqlBlock, bindVars, { autoCommit: false });
    const errorMessage = result.outBinds.error_message;
    const successMessage = result.outBinds.success_message;
    res.render('deleteFromInventory', { instrumentId, successMessage, errorMessage });
  } catch (error) {
    console.error('Transaction failed:', error);
    res.render('deleteFromInventory', { instrumentId, successMessage: null, errorMessage: error });
    await connection.rollback();
  } finally {
    await connection.close();
  }
});

app.get('/addToAssignations', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const musiciansQuery = 'SELECT name FROM musicians';
    const musiciansResult = await connection.execute(musiciansQuery);
    const musicians = musiciansResult.rows;
    const instrumentsQuery = 'SELECT type FROM instruments';
    const instrumentsResult = await connection.execute(instrumentsQuery);
    const instruments = instrumentsResult.rows;

    res.render('addToAssignations', {
      musicians,
      instruments,
      errorMessage: null,
      successMessage: null
    });
  } catch (error) {
    console.error('Error fetching data for Assignations form:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitAssignation', async (req, res) => {
  const musicianName = req.body.musicianName;
  const instrumentType = req.body.instrumentType;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  try {
    const connection = await oracledb.getConnection(dbConfig);
    const musicianIdQuery = 'SELECT musician_id FROM musicians WHERE name = :musicianName';
    const musicianIdResult = await connection.execute(musicianIdQuery, [musicianName]);
    const musicianId = musicianIdResult.rows[0][0];
    const instrumentIdQuery = 'SELECT instrument_id FROM inventory WHERE type = :instrumentType';
    const instrumentIdResult = await connection.execute(instrumentIdQuery, [instrumentType]);
    const instrumentId = instrumentIdResult.rows[0][0];
    const insertAssignationQuery = `
      INSERT INTO assignations (assignation_id, start_date, end_date, musician_id, instrument_id)
      VALUES (assignation_id_seq.nextval, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), :musicianId, :instrumentId)
    `;

    const bindVars = {
      startDate,
      endDate,
      musicianId,
      instrumentId
    };

    await connection.execute(insertAssignationQuery, bindVars, { autoCommit: true });

    res.render('addToAssignations', {
      musicians: [], 
      instruments: [], 
      successMessage: 'Assignation added successfully.',
      errorMessage: null
    });
  } catch (error) {
    console.error('Error submitting assignation:', error);
    res.render('addToAssignations', {
      musicians: [], 
      instruments: [], 
      successMessage: null,
      errorMessage: error
    });
  }
});


function formatDateTime(dateString) {
  const options = {
    day: '2-digit',
    month: '2-digit'
  };
  const formattedDate = new Date(dateString).toLocaleString('en-US', options);
  return formattedDate;
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

