# DB Deploy

All docs based on (largely copied from) content from http://dbdeploy.com

dbdeploy is a Database Change Management tool. It’s for developers or
DBAs who want to evolve their database design – or refactor their
database – in a simple, controlled, flexible and frequent manner.

## Why?

The recurring problem with database development is that at some point
you’ll need to upgrade an existing database and preserve its content.
In development environments it’s often possible (even desirable) to
blow away the database and rebuild from scratch as often as the code
is rebuilt but this approach cannot be taken forward into more
controlled environments such as QA, UAT and Production.

## How?

Drawing from our experiences, we’ve found that one of the easiest ways
to allow people to change the database is by using version-controlled
SQL delta scripts. We’ve also found it beneficial to ensure that the
scripts used to build development environments are the exact same used
in QA, UAT and production. Maintaining and making use of these deltas can
quickly become a significant overhead – dbdeploy aims to address this.

In essence dbdeploy keeps track of which SQL delta scripts have been run
against the database in a table called 'changelog' using this data it
can create deploy and undeploy SQL scripts based on all the SQL deltas
that have not yet been run.

## More Background

See the [original whitepaper](http://dbdeploy.com/wp-content/uploads/2007/05/taking-control-of-your-database-development.pdf)

Learn more about refactoring databases [Agile Data](http://www.agiledata.org/)

## Rules for using dbdeploy

When creating a delta file you will need to follow these conventions:
Make sure that EVERY database modification is written as a delta script to be picked up by dbdeploy.

Follow the naming convention for delta scripts. Script names must begin with a number that indicates the order in which it should be run (1.sql gets run first, then 2.sql and so on). You can optionally add a comment to the file name to describe what the script does (eg 1 Created the CustomerAddress table.sql) the comment will get written to the schema version table as the script is applied.

You can optionally add an undo section to your script. Write the script so it performs the do action first (eg create the CustomerAddress table) once all do actions have been scripted include the token --//@UNDO on a new line. Include the undo steps after this token.

If you realise that you’ve made a mistake in a delta script that’s been checked in then consider carefully how to fix it. See the note of caution below.

### Example

A developer needs to modify the database by adding a new table called foo. It is the third database modification to be written.

Create a file called "001 Create the new Foo table.sql"

The content of the file looks like this:

```
CREATE TABLE foo (
  foo_id INTEGER NOT NULL
  ,foo_value VARCHAR(30)
);

ALTER TABLE foo ADD CONSTRAINT pk_foo PRIMARY KEY (foo_id);

--//@UNDO

DROP TABLE foo;
```

A note of caution

dbdeploy works by checking to see if a particular delta script has been run against a particular database. To do this it uses the name of the delta script plus the name of the delta set (which will be "All" unless otherwise specified) and compares this against the content of the schema version table. If a delta script that has already been applied to a database is subsequently modified that subsequent modification will not be applied to the database.

In most circumstances the answer to amending what’s been done in a delta script is to just write another delta script. Using the example above, if next day business requirements change and it becomes necessary to add a FOO_DATE column to the FOO table then write a script called 2 Add foo_date to the foo table.sql. The content should look something like this:

```
--//Story400 - late-breaking requirement, need FOO_DATE column.

ALTER TABLE foo ADD (foo_date DATE NULL)
;

--//@UNDO

ALTER TABLE foo DROP COLUMN foo_date;
```

This all works fine so long as you don’t need to fix a genuine bug in a script. There are a couple of ways to mitigate against this, none of them ground-breaking:

Always perform a local build before you check in, this way the problem is caught and can be fixed prior to it getting under version control.

Use continuous integration – if your CI build breaks then the source code repository doesn’t get tagged until you’ve fixed the problem.
