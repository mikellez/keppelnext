username="postgres"
host="192.168.20.96"
database="cmms_dev"
backup_file="db.sql"
new_database=$1

if [ $# -lt 1 ];
then
  echo "$0: Missing arguments"
  exit 1
fi

echo "Creating a db.sql file"
cd "$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"
touch $backup_file
echo $backup_file " successfully created"
echo "dumping database into "$backup_file

pg_dump -U $username -h $host -s $database > "$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"/$backup_file
createdb -U $username -h $host $new_database
psql -U $username -h $host $new_database < $backup_file

echo "Removing "$backup_file
rm $backup_file


