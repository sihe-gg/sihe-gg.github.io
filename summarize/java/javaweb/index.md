# 

# JavaWeb 学习笔记

# 一、Servlet

- web.xml 中配置 servlet 映射
    
    ```xml
    <servlet>
    	<servlet-name>AddServlet</servlet-name>
    	<servlet-class>com.test.servlets.AddServlet</servlet-class>
    </servlet>
    
    <servlet-mapping>
    	<servlet-name>AddServlet</servlet-name>
    	<url-pattern>/add</url-pattern>
    </servlet-mapping>
    ```
    
    <aside>
    💡 request → url-pattern → AddServlet → servlet 对应的 servlet-name → 找到 servlet-calss 方法 → doPost()
    
    </aside>
    
- POST 方式下，设置编码，防止中文乱码。GET 方式目前不需要设置编码 （基于 tomcat8）
    
    ```java
    public void doPost (HttpServletRequest request, HttpServletResponse response) {
    	request.setCharacterEncoding("UTF-8");
    }
    
    // tomcat 7 Get 设置编码
    String fname = request.getParameter("fname");
    byte[] bytes = fname.getBytes("iso-8859-1");
    fname = new String(bytes, "UTF-8");
    ```
    
    <aside>
    💡 需要注意的是，设置编码必须放在所有获取参数之前
    
    </aside>
    
- 小结
    1. 继承关系：HttpServlet → GenericServlet → Servlet
    2. Servlet 中的核心方法：init(), service(), destory()
    3. 服务方法：
        1. 当有请求过来时，service 方法会自动响应（tomcat 容器调用）
        2. 在 HttpServlet 中会分析请求方式，（Get、Post、Put、Delete）
        3. 在 HttpServlet 中调用 do 开头方法，这些方法默认都是 405
        4. 需要子类继承重写相对应的 doPost、doGet 等方法
    4. Servlet 在容器中是：单例的、线程不安全的
- 服务器内部转发以及客户端重定向
    1. 服务器内部转发： request.getRequestDispatcher(”…”).forward(request, response)
    2. 客户端重定向：response.sendRedirect(”…”)

## 二、Java 获取 Xml 文件里的参数

- 根据 fruit 找到对应的组件：FruitController，这个对应的依据我们存储在 xx.xml中
    - <bean id=”fruit” class=”com.test.controller.FruitController”>
    
    ```java
    // 通过类获取输入流
    InputStream is = this.getClass().getClassLoader().getResourceAsStream("xx.xml");
    try {
    	// 获取 xml 配置文件
    	DocumentBuildFactory dbf = DocumentBuildFactory.newInstance();
    	DocumentBuild db = dbf.newDocumentBuild();
    	Document doc = db.parse(is);
    	// 通过 document 获取元素
    	Element element = doc.getDocumentElement();
    	// 获取所有 bean 节点
    	NodeList nodeList = element.getElementsByTagName("bean");
    	
    	for (int i = 0; i < nodeList.getLength(); i++) {
    		// 获取每一个 bean
    		Node bean = nodeList.item(i);
    		/* 节点类型是元素节点 Xml 有元素节点和文本节点
    			 <bean>hello</bean>
    		   <bean>为元素节点，hello 为文本节点
    		*/
    		if (bean.getNodeType == Node.ELEMENT_NODE) {
    			// 强制转 element 并获取 id and class
    			Element ele = (Element) bean;
    			String id = ele.getAttribute("id");
    			String clazz = ele.getAttribute("class");
    
    			// 获取 bean 类，FruitController、UserController
    			Object beanObj = Class.forName(clazz).newInstance();
    		}
    	}
    }
    ```
    

## 三、Servlet 生命周期中的方法

1. 初始化方法：init()、init(config)
    
    ```java
    public void init(ServletConfig config) throws ServletException {
    	this.config = config;
    	init();
    }
    ```
    
    - 因此，如果我们需要在初始化执行一些自定义操作，可以重写无参 init()
    - 我们可以通过 getConfig() 获取 ServletConfig 对象
    - 通过 config.getInitParameter() 获取初始化参数 - web.xml 里的
2. 通过 ServletContext 获取配置的上下文参数

### DispatcherServlet 和 Ioc 整合，Spring 框架底层原理

[DispathcerServlet](/summarize/java/DispathcerServlet.md)

## 四、Filter

1. Filter 也属于 Servlet 规范
2. Filter 开发步骤：新建类实现 Filter 接口，然后实现其中的三个方法：init、doFilter、destory
3. 配置 Filter，可以用注解@WebFilter，也可以使用 xml 文件 <filter><filter-mapping>
4. 过滤器链 FilterChain
    - 如果采取的是注解方式配置，那么过滤器的拦截顺序是按照全类名的先后顺序排序的
    - 如果采取的是 xml 方式配置，那么按照配置的先后顺序进行排序

## 五、ThreadLocal

- ThreadLocal 称之为本地线程
- 我们可以通过 set() 方法在当前线程上存储数据，通过 get() 方法在当前线程上获取数据

## 六、Listener

1. ServletContextListener - 监听 ServletContext 对象的创建和销毁的过程
2. HttpSessionListener - 监听 HttpSession 对象的创建和销毁的过程
3. ServletRequestListener - 监听 ServletRequest 对象的创建和销毁的过程
4. ServletContextAttributeListener - 监听 ServletContext 的保存作用域改动 (add、remove、replace)
5. HttpSessionAttributeListener - 监听 HttpSession 的保存作用域改动 (add、remove、replace)
6. ServletRequestAttributeListener - 监听 ServletRequest 的保存作用域改动 (add、remove、replace)
7. HttpSessionBindingListener - 监听某个对象在 Session 域中的创建与移除
8. HttpSessionActivationListener - 监听某个对象在 Session 域中的序列化和反序列化
