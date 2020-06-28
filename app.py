from flask import Flask,render_template,url_for, request, make_response,flash, json, send_file
from werkzeug.utils import secure_filename
from drawGraph import drawgraph
from subprocess import run,PIPE
from analyse import Csv
from os.path import isfile, splitext
from time import time
from bs4 import BeautifulSoup as bs
app=Flask(__name__)
static = app.root_path + '/static/'

@app.route('/')
def index():
    return render_template('ml.html')

@app.route('/favicon.ico')
def myicon():
    path = static+'favicon.ico'
    return send_file(path)

@app.route('/testing/')
def testing():
    return render_template('testing.html')


@app.route('/plotYourFile/',methods=['GET','POST'])
def plotYourFile():
    if request.method=='POST':
        file=request.files['file']
        name=secure_filename(file.filename)
        file.save(static+'myfiles/'+name)
        obj = Csv(static+'myfiles/'+name)
        if obj.error:
            return render_template('analyse.html',good="File not readable", cols={})
        resp = make_response(render_template('analyse.html', fname=name, cols=obj.cols()))
        resp.set_cookie('file',name)
        return resp
    file = request.cookies.get('file')
    if file:
        obj = Csv(static+'myfiles/'+file)
        if obj.error:
            resp = make_response(render_template('analyse.html'))
            resp.delete_cookie('file')
            return resp
        else:
            return render_template('analyse.html', fname=file, cols=obj.cols())
    return render_template('analyse.html', cols={})


@app.route('/plot', methods=['POST'])
def plot():
    try:
        f = request.form
        obj = Csv(static+'myfiles/'+request.cookies.get('file'))
        if f.get('col2'):
            val= obj.plot(f['gtype'],f['col1'],f['col2'])
        else:
            val= obj.plot(f['gtype'],f['col1'])
        return val
    except Exception as e:
        return str(e)
        
@app.route('/text')
def showdata():
    q = request.args['q']
    obj = Csv(static+'myfiles/'+request.cookies.get('file'))
    if q=='descrip':
        return obj.describe()
    elif q=='alook':
        return obj.head()
    else:
        return obj.show()

'''
@app.route('/delcook')
def delcook():
    resp = make_response(render_template('analyse.html', hasfile='no', cols={}))
    resp.set_cookie('file','',max_age=-1)
    return resp
'''

@app.route('/EquationPlotter/')
def EquationPlotter():
    return render_template('equation.html')

@app.route('/drawEquation', methods=['POST'])
def drawEquation():
    try:
        eq = request.form['eq']
        imdata = drawgraph(eq,fpath=static)
        return imdata
    except Exception as e:
        return "Error occured on server: "+str(e)

@app.route('/savePage', methods=['POST'])
def savePage():
    user = request.cookies.get('user')
    if not user:
        return json.dumps({'code':1, 'msg':'Cookie Error'})
    code = request.get_json()
    fname=static+'mypage/'+user+'.html'
    with open(fname, "w", encoding="utf-8") as f:
        f.write(code)
    return json.dumps({'code':0, 'msg':'Saved'})

@app.route('/saveImage', methods=['POST'])
def saveImage():
    try:
        file=request.files['file']
        name=secure_filename(file.filename)
        f,ext=splitext(name)
        name='img'+str(int(time()*1000))+ext
        fname=static+'mypage/'+name
        file.save(fname)
        return json.dumps({'code':0, 'msg':name})
    except Exception as e:
        return json.dumps({'code':1, 'msg':str(e)})

@app.route('/savePass', methods=['POST'])
def savePass():
    password = str(sum([ord(i)<<20 for i in s]))
    return json.dumps({'code':0, 'msg':password})
    
    
@app.route('/myPage/')
@app.route('/mypage/')
@app.route('/myPage/<name>')
@app.route('/mypage/<name>')
def mypage(name=None):
    try:
        if name==None:
            return render_template('mypage.html')
        else:
            path = static+'mypage/'+name+'.html'
            if isfile(path):
                return send_file(path)
            return "Error 404 : Sorry no user named - " + name
    except Exception as e:
        return "Error occured on server: "+str(e)

@app.route('/createPage/')
@app.route('/createpage/')
@app.route('/createPage/<name>')
@app.route('/createpage/<name>')
def createPage(name=None):
    try:
        if name:
            path = static+'mypage/'+name+'.html'
            if isfile(path):
                with open(path, encoding="utf-8") as f:
                    page=bs(f,'html.parser').find('div',attrs={'id':'page'})
                with open(app.root_path+'/templates/createPage.html', encoding="utf-8") as f:
                    newpage=bs(f,'html.parser')
                newpage.find('div',attrs={'id':'page'}).decompose()
                newpage.body.insert(2,page)
                resp = make_response(str(newpage))
                resp.set_cookie('user',name)
                return resp
            else:
                return "Error 404 : Sorry no user named - " + name
        user = request.cookies.get('user')
        if user:
            resp = make_response(render_template('createPage.html'))
            resp.headers['cache-control']='no-cache,no-store'
            return resp
        else:
            return render_template('myPage.html')
    except Exception as e:
        return "Error occured on server: "+str(e)
    
@app.route('/checkPage', methods=['POST'])
def checkPage():
    try:
        user = request.get_json()
        path = static+'mypage/'+user+'.html'
        if isfile(path):
            return json.dumps({'code':1, 'msg':'User already exists'})
        return json.dumps({'code':0, 'msg':user})
    except Exception as e:
        return json.dumps({'code':1, 'msg':str(e)})

@app.route('/comments')
def comments():
    try:
        path = static+'comments.txt'
        with open(path,encoding='utf-8') as f:
            return json.dumps({'code':0, 'msg':f.read()})
    except Exception as e:
        return json.dumps({'code':1, 'msg':str(e)})
        
@app.route('/storeit', methods=['POST'])
def storeit():
    try:
        comm = request.get_json()
        path = static+'comments.txt'
        with open(path,'a',encoding='utf-8') as f:
            f.write(comm)
        return json.dumps({'code':0, 'msg':'saved'})
    except Exception as e:
        return json.dumps({'code':1, 'msg':str(e)})

if __name__ == '__main__':
   app.run(host='0.0.0.0',debug=1)

