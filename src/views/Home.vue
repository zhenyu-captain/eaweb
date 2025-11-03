<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Learning that moves you forward.</h1>
        <p class="hero-subtitle">
          Our innovative platform empowers tax professionals to grow with confidence—smarter, faster, and fully equipped for what's next.
        </p>
        <button @click="goToLogin" class="cta-button">
          Get Started
        </button>
        <img src="/images/image.png" alt="Hero image" class="hero-image" />
      </div>
    </section>

    <!-- Three Core Features -->
    <section class="features-section">
      <div class="feature-card">
        <h2 class="feature-title">Expert Instruction</h2>
        <p class="feature-description">
          The foundation of a great course is expert instruction and content. We organize the most important exam topics in a clear and efficient way, allowing you to focus on what you must know to pass the test.
        </p>
        <img src="/images/image-1.png" alt="Expert Instruction" class="feature-image" />
      </div>

      <div class="feature-card">
        <h2 class="feature-title">Powerful Technology</h2>
        <p class="feature-description">
          We've refined our personalized learning technology to enhance every aspect of your study experience. Our proprietary delivers an intuitive, data-driven platform tailored to your needs—offering powerful insights and tools you won't find anywhere else.
        </p>
        <img src="/images/image-2.png" alt="Powerful Technology" class="feature-image" />
      </div>

      <div class="feature-card">
        <h2 class="feature-title">Unparalleled Support</h2>
        <p class="feature-description">
          Self-study doesn't mean you're alone—we're your partner in success, in your corner every step of the way. Whether you need guidance, motivation, or quick answers, we're here to help. Give us the opportunity, and we'll go above and beyond to exceed your expectations.
        </p>
        <img src="/images/image-3.png" alt="Unparalleled Support" class="feature-image" />
      </div>
    </section>

    <!-- EA Exam Prep Section -->
    <section class="exam-prep-section">
      <div class="section-container">
        <h2 class="section-title">Enrolled Agent Exam Prep</h2>
        <p class="section-description">
          Prepare for your career with our EA Prep Course
        </p>
        <p class="section-text">
          Get a professional credential with our industry-leading EA exam preparation methods. Online adaptive learning promises a more efficient study experience, but few providers deliver real value. Our approach empowers data-driven decision-making and sets you up for success.
        </p>
        <img src="/images/image-4.png" alt="EA Exam Prep" class="section-image" />
      </div>
    </section>

    <!-- We Make It Easier Section -->
    <section class="easier-section">
      <div class="section-container">
        <h2 class="section-title">We make it easier.</h2>
        <p class="section-description">
          Every function and feature of our learning platform is designed to make studying for the Enrolled Agent Exam as easy as possible. Because let's face it—half the challenge of studying is figuring out how you learn best. we gives you the tools to study smarter, stay on track, and feel confident when test day arrives.
        </p>

        <div class="easier-grid">
          <div class="easier-item">
            <h3 class="easier-item-title">Easier to learn</h3>
            <p class="easier-item-text">
              Intuitive, side-by-side design of our platform ensures all of your learning resources are accessible with a simple click.
            </p>
          </div>

          <div class="easier-item">
            <h3 class="easier-item-title">Easier to Focus</h3>
            <p class="easier-item-text">
              Know where to invest your time — Track your confidence in each topic with our advanced performance analysis tools.
            </p>
          </div>

          <div class="easier-item">
            <h3 class="easier-item-title">Easier to connect</h3>
            <p class="easier-item-text">
              Engage with instructors and fellow learners in the platform — Get clarity on difficult topics or celebrate a passing score with your peers!
            </p>
          </div>

          <div class="easier-item">
            <h3 class="easier-item-title">Easier to succeed</h3>
            <p class="easier-item-text">
              With top-tier instruction, cutting-edge technology, and exceptional support, you'll be on the fast track to EA exam success.
            </p>
          </div>
        </div>

        <img src="/images/image-5.png" alt="We make it easier" class="section-image" />
      </div>
    </section>

    <!-- Learning Features Section -->
    <section class="learning-features-section">
      <div class="section-container">
        <div class="learning-feature">
          <h2 class="section-title">Personalized Learning</h2>
          <p class="section-text">
            Pinpointing strengths and weaknesses is key to success. Our real-time analytics personalize learning with tailored recommendations, helping each student focus on what matters most.
          </p>
        </div>

        <div class="learning-feature">
          <h2 class="section-title">User-Friendly Design</h2>
          <p class="section-text">
            Complex subjects don't have to mean a complicated experience. We ensure students have the best tools and an intuitive platform that makes learning as smooth as possible.
          </p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-container">
        <h2 class="section-title">What everyone is saying...</h2>
        <p class="section-description">
          See why candidates trust we for their exam prep. Hear from real customers who've mastered key concepts, built confidence, and successfully earned their Enrolled Agent credential—ready to advance their careers.
        </p>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <p class="testimonial-text">
              "I used FFA for the EA exam after becoming frustrated with GLEIM and fell in love with the adaptive software. FFA software and overall system is a large part of the reason I am an EA today. Thank you!"
            </p>
            <p class="testimonial-author">— Kenneth M.</p>
          </div>

          <div class="testimonial-card">
            <p class="testimonial-text">
              "I was able to pass all 3 exams within my desired timeframe, all while working full-time and becoming a first-time mom! FFA is a wonderful prep course. The mentors were always available whenever you had challenges or have a question."
            </p>
            <p class="testimonial-author">— Sarah L.</p>
          </div>

          <div class="testimonial-card">
            <p class="testimonial-text">
              "I like the community because it helps give me more detail on the already great explanations. Notes feature was also helpful in giving me a way to recall info for future study."
            </p>
            <p class="testimonial-author">— Amanda S.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Methodology Section -->
    <section class="methodology-section">
      <div class="section-container">
        <h2 class="section-title">The Gleim Methodology</h2>
        <p class="section-subtitle">What we do sets us apart.</p>
        <p class="section-text">
          Our materials are structured to help you improve and turn every mistake into a learning opportunity. Every question in our course has explanations for both right and wrong answers because we want you to understand the concepts behind the questions. Our approach has been vetted by authors with prestigious university careers—passionate educators who have spent their lives training new generations of tax professionals
        </p>
        <p class="section-text">
          You'll learn quickly, but more importantly, you'll build a deep understanding of the topics that will serve you throughout your tax career.
        </p>
        <img src="/images/image-6.png" alt="Gleim Methodology" class="section-image" />
      </div>
    </section>

    <!-- Adaptive Technology Section -->
    <section class="adaptive-section">
      <div class="section-container">
        <h2 class="section-title">Adaptive Technology</h2>
        <p class="section-subtitle">Know what to study. Know how to study it.</p>
        <p class="section-text">
          You don't just get the best materials. You get industry-leading tools and features that guarantee you a passing score. our adaptive online platform, is your personal exam tutor. It evaluates your performance, guides you to the resources you need, and adjusts as your quiz scores improve. even tells you when you're ready to take your exam.
        </p>
        <img src="/images/image-7.png" alt="Adaptive Technology" class="section-image" />
      </div>
    </section>

    <!-- Exam Environment Section -->
    <section class="exam-environment-section">
      <div class="section-container">
        <h2 class="section-title">Realistic Exam Environment</h2>
        <p class="section-subtitle">Don't just build knowledge. Build confidence.</p>
        <p class="section-text">
          The best way to build your confidence is to get familiar with the Prometric testing environment you'll encounter on test day. All of our questions match the exam, but the full-length mock exams built into the course give you an authentic test-day experience. Our mock exams reproduce everything, from the look and length of the test to the weighting of the topics, exactly like you'll encounter on the real EA exam. When you're finished, any topics you still need to brush up on will be emphasized in your personalized Final Review so you can be fully confident on exam day!
        </p>
        <img src="/images/image-8.png" alt="Realistic Exam Environment" class="section-image" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  line-height: 1.6;
  opacity: 0.95;
}

.cta-button {
  display: inline-block;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-bottom: 40px;
  text-transform: none;
  letter-spacing: 0.5px;
}

.cta-button:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-button:active {
  transform: translateY(0);
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  margin-top: 40px;
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: #f8f9fa;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.feature-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #666;
  margin-bottom: 30px;
}

.feature-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Common Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.section-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 30px;
  color: #555;
  text-align: center;
}

.section-description {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #666;
  margin-bottom: 40px;
  text-align: center;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #666;
  margin-bottom: 20px;
}

.section-image {
  width: 100%;
  max-width: 1000px;
  height: auto;
  border-radius: 12px;
  margin: 40px auto;
  display: block;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* Exam Prep Section */
.exam-prep-section {
  background: white;
}

/* Easier Section */
.easier-section {
  background: #f8f9fa;
}

.easier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 60px 0;
}

.easier-item {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.easier-item:hover {
  transform: translateY(-3px);
}

.easier-item-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #667eea;
}

.easier-item-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #666;
}

/* Learning Features Section */
.learning-features-section {
  background: white;
}

.learning-feature {
  margin-bottom: 60px;
}

.learning-feature:last-child {
  margin-bottom: 0;
}

/* Testimonials Section */
.testimonials-section {
  background: #f8f9fa;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 50px;
}

.testimonial-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #667eea;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  font-style: italic;
  margin-bottom: 20px;
}

.testimonial-author {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
}

/* Methodology Section */
.methodology-section {
  background: white;
}

/* Adaptive Section */
.adaptive-section {
  background: #f8f9fa;
}

/* Exam Environment Section */
.exam-environment-section {
  background: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .cta-button {
    padding: 14px 36px;
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-section {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }

  .easier-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .section-container {
    padding: 50px 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .cta-button {
    padding: 12px 32px;
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .hero-section {
    padding: 50px 20px;
  }
}
</style>
