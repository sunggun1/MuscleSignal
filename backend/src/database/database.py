from flask_sqlalchemy import SQLAlchemy
from src.config import showjson

sa_url = "mysql+pmysql://"+showjson()['db']['user']+":"+showjson()['db']['password']+"@"+showjson()['db']['host']+"/"+showjson()['db']['name']
# engine = SQLAlchemy.create_engine(sa_url={sa_url}, engine_opts={})

# db = SQLAlchemy()


# db_session = scoped_session(
#     sessionmaker(
#         bind=engine,
#         autocommit=False,
#         autoflush=False
#     )
# )

# Session = SQLAlchemy.orm.sessionmaker()
# Session.configure(bind=engine)
# session = Session()

# Base = SQLAlchemy.declarative_base()
        
